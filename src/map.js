// SVG 地图：构建 DOM（省/市/区县/乡镇四级）、外边缘高亮提取、乡镇真实坐标分区、viewBox 缩放动画
import data from './map-data.json';
import { lonLatToSvg, svgToLonLat } from './basemap.js';

const NS = 'http://www.w3.org/2000/svg';
const INSET_RADIUS = 6; // 南海插图卡片圆角（viewBox 单位，全国视图下约 5～8px）

export const units = data.units;
export const cities = data.cities;
export const provinces = data.provinces;
export const unitByCode = new Map(units.map(u => [u.code, u]));
export const cityByCode = new Map(cities.map(c => [c.code, c]));
export const provinceByCode = new Map(provinces.map(p => [p.code, p]));

const unitsByProvince = new Map();
for (const u of units) (unitsByProvince.get(u.province) ?? unitsByProvince.set(u.province, []).get(u.province)).push(u);
export const unitsOf = code => unitsByProvince.get(code) ?? [];

const citiesByProvince = new Map();
for (const c of cities) (citiesByProvince.get(c.province) ?? citiesByProvince.set(c.province, []).get(c.province)).push(c);
export const citiesOf = code => citiesByProvince.get(code) ?? [];

const unitsByCity = new Map();
for (const u of units) (unitsByCity.get(u.city) ?? unitsByCity.set(u.city, []).get(u.city)).push(u);
export const unitsOfCity = code => unitsByCity.get(code) ?? [];

export const FULL_VIEW = data.viewBox;

// 三沙市下辖西沙区、南沙区
export const SANSHA_CODES = ['460301', '460302'];
export const isSansha = code => SANSHA_CODES.includes(code);

// ---------- 精度层级与乡镇数据加载 ----------
const coarse = { units: Object.fromEntries(units.map(u => [u.code, u.d])), lines: data.lines, outline: data.outline };
let fine = null;
let finePromise = null;
export const loadFine = () => finePromise ??= import('./map-fine.json').then(m => (fine = m.default));
export const hasFine = () => fine !== null;

let rawTowns = null;
let townsPromise = null;
export const loadTowns = () => townsPromise ??= import('./towns-data.json').then(m => (rawTowns = m.default));
export const hasTowns = () => rawTowns !== null;
export const getRawTowns = () => rawTowns;

// 某区县当前可用的最精细轮廓（地图坐标）
export const unitPath = code => fine?.units[code] ?? coarse.units[code];
// 某地级市当前可用的合并轮廓（省视图下用于地级市名称避让布局）
export const cityPath = code => unitsOfCity(code).map(u => unitPath(u.code)).filter(Boolean).join('');

// ---------- 四级乡镇/街道真实坐标辖区剖分 ----------
const parsePathRings = d => {
  const rings = [];
  if (!d) return rings;
  for (const sp of d.split(/(?=M)/)) {
    if (!sp) continue;
    const nums = sp.slice(1).replace(/z$/i, '').trim().split(/[l\s]+/).map(Number);
    if (nums.length < 6) continue;
    let x = nums[0], y = nums[1];
    const r = [[x, y]];
    for (let i = 2; i < nums.length; i += 2) {
      x += nums[i];
      y += nums[i + 1];
      r.push([x, y]);
    }
    rings.push(r);
  }
  return rings;
};

const ptInRing = (px, py, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
};

const ptInRings = (px, py, rings) => {
  let inside = false;
  for (const r of rings) if (ptInRing(px, py, r)) inside = !inside;
  return inside;
};

const clipRingHalfPlane = (ring, mx, my, nx, ny) => {
  const out = [];
  const n = ring.length;
  if (!n) return out;
  let prev = ring[n - 1];
  let prevVal = (prev[0] - mx) * nx + (prev[1] - my) * ny;
  for (let i = 0; i < n; i++) {
    const curr = ring[i];
    const currVal = (curr[0] - mx) * nx + (curr[1] - my) * ny;
    if (currVal <= 0) {
      if (prevVal > 0) {
        const t = prevVal / (prevVal - currVal);
        out.push([prev[0] + (curr[0] - prev[0]) * t, prev[1] + (curr[1] - prev[1]) * t]);
      }
      out.push(curr);
    } else if (prevVal <= 0) {
      const t = prevVal / (prevVal - currVal);
      out.push([prev[0] + (curr[0] - prev[0]) * t, prev[1] + (curr[1] - prev[1]) * t]);
    }
    prev = curr;
    prevVal = currVal;
  }
  return out;
};

const ringCentroidAndArea = ring => {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    a += cross;
    cx += (ring[j][0] + ring[i][0]) * cross;
    cy += (ring[j][1] + ring[i][1]) * cross;
  }
  a /= 2;
  if (Math.abs(a) < 1e-7) return { area: 0, cx: ring[0]?.[0] ?? 0, cy: ring[0]?.[1] ?? 0 };
  return { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a) };
};

const ringsToD = rings => {
  let d = '';
  for (const r of rings) {
    if (r.length < 3) continue;
    d += `M${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}`;
    for (let i = 1; i < r.length; i++) {
      d += `L${r[i][0].toFixed(2)} ${r[i][1].toFixed(2)}`;
    }
    d += 'Z';
  }
  return d;
};

const ringsBBox = rings => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) {
    for (const [x, y] of r) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  return [x0, y0, x1, y1];
};

const countyTownsCache = new Map(); // unitCode -> { detail, list }
const townByCode = new Map();

export const getTownByCode = code => {
  if (townByCode.has(code)) return townByCode.get(code);
  const unitCode = code.slice(0, 6);
  if (unitByCode.has(unitCode)) {
    townsOfUnit(unitCode);
    return townByCode.get(code) ?? null;
  }
  return null;
};

export const townsOfUnit = unitCode => {
  const cached = countyTownsCache.get(unitCode);
  if (cached && cached.detail === (fine ? 'fine' : 'coarse')) return cached.list;
  const u = unitByCode.get(unitCode);
  if (!u || !rawTowns) return [];
  const entries = rawTowns[unitCode] ?? [];
  if (!entries.length) return [];

  const d = unitPath(unitCode);
  const rings = parsePathRings(d);
  const N = entries.length;

  if (!rings.length) {
    const list = entries.map(([code, name, short, py, pi, tLon, tLat]) => {
      const t = {
        code, name, short, py, pi,
        unit: u.code, city: u.city, province: u.province,
        d: '', label: null, bbox: u.bbox,
        area: Math.max(1, Math.round((u.area || N) / N)),
        center: tLon && tLat ? [Math.round(tLon * 100) / 100, Math.round(tLat * 100) / 100] : u.center,
      };
      townByCode.set(code, t);
      return t;
    });
    countyTownsCache.set(unitCode, { detail: fine ? 'fine' : 'coarse', list });
    return list;
  }

  const mainRing = rings.reduce((a, b) => (ringCentroidAndArea(b).area > ringCentroidAndArea(a).area ? b : a));
  const { cx: cx0, cy: cy0, area: mainArea } = ringCentroidAndArea(mainRing);
  const rEst = Math.sqrt(mainArea / Math.PI);

  // 使用国家地名信息库 / 高德地图真实乡镇驻地经纬度 (tLon, tLat) 投影至 Albers 平面坐标作为分区中心
  const seeds = entries.map(([, , , , , tLon, tLat], i) => {
    if (typeof tLon === 'number' && typeof tLat === 'number') {
      let [sx, sy] = lonLatToSvg(tLon, tLat);
      if (!ptInRings(sx, sy, rings)) {
        // 若驻地坐标因边界简化略微落在多边形外，向最近边界顶点与质心微调拉回多边形内
        let bestX = cx0, bestY = cy0, bestD2 = Infinity;
        for (const r of rings) {
          for (const [vx, vy] of r) {
            const d2 = (vx - sx) ** 2 + (vy - sy) ** 2;
            if (d2 < bestD2) { bestD2 = d2; bestX = vx; bestY = vy; }
          }
        }
        sx = bestX * 0.85 + cx0 * 0.15;
        sy = bestY * 0.85 + cy0 * 0.15;
      }
      return [sx, sy];
    }
    const rad = rEst * 0.62 * Math.sqrt((i + 0.45) / N);
    const ang = i * 2.399963229728653;
    return [cx0 + Math.cos(ang) * rad, cy0 + Math.sin(ang) * rad];
  });

  // 防止同址街道坐标完全重合导致法向量为零
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = seeds[j][0] - seeds[i][0], dy = seeds[j][1] - seeds[i][1];
      if (dx * dx + dy * dy < 1e-6) {
        const ang = (j - i) * 1.1;
        seeds[j][0] += Math.cos(ang) * 0.015;
        seeds[j][1] += Math.sin(ang) * 0.015;
      }
    }
  }

  const computeCells = curSeeds => curSeeds.map(([sx, sy], i) => {
    let cellRings = rings.map(r => r.slice());
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const [ox, oy] = curSeeds[j];
      const mx = (sx + ox) / 2, my = (sy + oy) / 2;
      const nx = ox - sx, ny = oy - sy;
      cellRings = cellRings.map(r => clipRingHalfPlane(r, mx, my, nx, ny)).filter(r => r.length >= 3);
    }
    return cellRings;
  });

  // 仅做 1 次轻量级 (22%) 质心舒缓：既严格保持真实东西南北地理方位，又让主城区密集街道拥有适度舒展的可点击面积
  let cells = computeCells(seeds);
  if (N > 1) {
    const relaxedSeeds = cells.map((cellRings, i) => {
      let totA = 0, sumX = 0, sumY = 0;
      for (const r of cellRings) {
        const { area, cx, cy } = ringCentroidAndArea(r);
        totA += area; sumX += cx * area; sumY += cy * area;
      }
      if (totA <= 0) return [seeds[i][0] * 0.7 + cx0 * 0.3, seeds[i][1] * 0.7 + cy0 * 0.3];
      const cx = sumX / totA, cy = sumY / totA;
      return [seeds[i][0] * 0.78 + cx * 0.22, seeds[i][1] * 0.78 + cy * 0.22];
    });
    cells = computeCells(relaxedSeeds);
  }

  const cellStats = cells.map((cellRings, i) => {
    let totA = 0, sumX = 0, sumY = 0;
    for (const r of cellRings) {
      const { area, cx, cy } = ringCentroidAndArea(r);
      totA += area; sumX += cx * area; sumY += cy * area;
    }
    const lx = totA > 0 ? sumX / totA : seeds[i][0];
    const ly = totA > 0 ? sumY / totA : seeds[i][1];
    return { svgArea: totA, label: [Math.round(lx * 100) / 100, Math.round(ly * 100) / 100] };
  });
  const totalSvgArea = cellStats.reduce((s, c) => s + c.svgArea, 0) || 1;

  const list = entries.map(([code, name, short, py, pi, tLon, tLat], i) => {
    const cellRings = cells[i];
    const { svgArea, label } = cellStats[i];
    const areaKm2 = Math.max(1, Math.round(((u.area || N * 15) * svgArea) / totalSvgArea));
    const [lon, lat] = (typeof tLon === 'number' && typeof tLat === 'number')
      ? [tLon, tLat]
      : svgToLonLat(label[0], label[1]);
    const t = {
      code,
      name,
      short,
      py,
      pi,
      unit: u.code,
      city: u.city,
      province: u.province,
      d: ringsToD(cellRings),
      label,
      bbox: cellRings.length ? ringsBBox(cellRings) : u.bbox,
      area: areaKm2,
      center: [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100],
    };
    townByCode.set(code, t);
    return t;
  });

  countyTownsCache.set(unitCode, { detail: fine ? 'fine' : 'coarse', list });
  return list;
};

export const townPath = code => getTownByCode(code)?.d ?? '';

// ---------- 外边缘轮廓提取 ----------
// 从一组拓扑对齐的区县 path 中消去内部公共边，只保留整块区域最外圈边界（边缘一圈）
const outerBoundaryD = dList => {
  const edgeMap = new Map();
  for (const d of dList) {
    if (!d) continue;
    const subpaths = d.split(/(?=M)/);
    for (const sp of subpaths) {
      const nums = sp.slice(1).replace(/z$/i, '').trim().split(/[l\s]+/).map(Number);
      if (nums.length < 4) continue;
      let x = Math.round(nums[0] * 1000), y = Math.round(nums[1] * 1000);
      const pts = [[x, y]];
      for (let i = 2; i < nums.length; i += 2) {
        x += Math.round(nums[i] * 1000);
        y += Math.round(nums[i + 1] * 1000);
        pts.push([x, y]);
      }
      for (let i = 0, n = pts.length; i < n; i++) {
        const a = pts[i], b = pts[(i + 1) % n];
        if (a[0] === b[0] && a[1] === b[1]) continue;
        const k1 = `${a[0]},${a[1]}`, k2 = `${b[0]},${b[1]}`;
        const key = k1 < k2 ? `${k1}:${k2}` : `${k2}:${k1}`;
        if (edgeMap.has(key)) edgeMap.delete(key);
        else edgeMap.set(key, [a, b, k1, k2]);
      }
    }
  }
  const adj = new Map();
  for (const [key, [a, b, k1, k2]] of edgeMap) {
    let l1 = adj.get(k1); if (!l1) { l1 = []; adj.set(k1, l1); }
    let l2 = adj.get(k2); if (!l2) { l2 = []; adj.set(k2, l2); }
    l1.push({ key, pt: b, k: k2 });
    l2.push({ key, pt: a, k: k1 });
  }
  const used = new Set();
  let out = '';
  for (const [key, [a, b, k1, k2]] of edgeMap) {
    if (used.has(key)) continue;
    used.add(key);
    const chain = [a, b];
    let cur = k2;
    while (true) {
      const nexts = adj.get(cur);
      const next = nexts && nexts.find(e => !used.has(e.key));
      if (!next) break;
      used.add(next.key);
      chain.push(next.pt);
      cur = next.k;
    }
    const closed = cur === k1;
    out += `M${chain[0][0] / 1000} ${chain[0][1] / 1000}`;
    for (let i = 1; i < (closed ? chain.length - 1 : chain.length); i++) {
      out += `L${chain[i][0] / 1000} ${chain[i][1] / 1000}`;
    }
    if (closed) out += 'Z';
  }
  return out;
};

const outlineCache = new Map();
const getOutline = (type, code, detailLevel) => {
  if (type === 'town') return getTownByCode(code)?.d ?? '';
  const key = `${detailLevel}:${type}:${code}`;
  let d = outlineCache.get(key);
  if (d !== undefined) return d;
  const src = detailLevel === 'fine' && fine ? fine.units : coarse.units;
  if (type === 'unit') {
    d = src[code] ?? '';
  } else if (type === 'city') {
    d = outerBoundaryD(unitsOfCity(code).map(u => src[u.code]));
  } else if (type === 'province') {
    d = outerBoundaryD(unitsOf(code).map(u => src[u.code]));
  } else {
    d = '';
  }
  outlineCache.set(key, d);
  return d;
};

const TONE_COUNT = 6;
const extractPathVerts = d => {
  const set = new Set();
  if (!d) return set;
  for (const sp of d.split(/(?=M)/)) {
    if (!sp) continue;
    const isAbs = sp.includes('L');
    const nums = sp.slice(1).replace(/z$/i, '').trim().split(/[lL\s]+/).map(Number);
    if (nums.length < 4) continue;
    let x = nums[0], y = nums[1];
    set.add(`${Math.round(x * 10)},${Math.round(y * 10)}`);
    for (let i = 2; i < nums.length; i += 2) {
      if (isAbs) {
        x = nums[i];
        y = nums[i + 1];
      } else {
        x += nums[i];
        y += nums[i + 1];
      }
      set.add(`${Math.round(x * 10)},${Math.round(y * 10)}`);
    }
  }
  return set;
};

const unitVertsMap = new Map();
for (const u of units) unitVertsMap.set(u.code, extractPathVerts(u.d));

const shareVertices = (setA, setB) => {
  if (!setA || !setB || !setA.size || !setB.size) return false;
  const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let shared = 0;
  for (const v of small) {
    if (large.has(v) && ++shared >= 2) return true;
  }
  return false;
};

const assignTones = (items, getVerts) => {
  const list = items.filter(it => it.bbox);
  const n = list.length;
  const tones = new Map();
  if (!n) return tones;
  const verts = list.map(it => getVerts(it));
  const adj = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (shareVertices(verts[i], verts[j])) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  // 按邻接度降序 + 空间位置排序，使贪心四色/六色着色零冲突且色调分布均匀
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => {
    if (adj[j].length !== adj[i].length) return adj[j].length - adj[i].length;
    const ay = list[i].bbox[1], by = list[j].bbox[1];
    return Math.abs(ay - by) > 1 ? ay - by : list[i].bbox[0] - list[j].bbox[0];
  });
  const assigned = new Array(n).fill(-1);
  const usage = new Array(TONE_COUNT).fill(0);
  for (const idx of order) {
    const neighborUsed = new Set();
    for (const nb of adj[idx]) {
      if (assigned[nb] !== -1) neighborUsed.add(assigned[nb]);
    }
    let bestTone = 0;
    let bestScore = Infinity;
    for (let t = 0; t < TONE_COUNT; t++) {
      const conflictPenalty = neighborUsed.has(t) ? 1000 : 0;
      const score = conflictPenalty + usage[t];
      if (score < bestScore) {
        bestScore = score;
        bestTone = t;
      }
    }
    assigned[idx] = bestTone;
    usage[bestTone]++;
    tones.set(list[idx].code, bestTone);
  }
  return tones;
};

const cityVertsMap = new Map();
for (const c of cities) {
  const s = new Set();
  for (const u of unitsOfCity(c.code)) {
    const uv = unitVertsMap.get(u.code);
    if (uv) for (const v of uv) s.add(v);
  }
  cityVertsMap.set(c.code, s);
}

const provVertsMap = new Map();
for (const p of provinces) {
  const s = new Set();
  for (const u of unitsOf(p.code)) {
    const uv = unitVertsMap.get(u.code);
    if (uv) for (const v of uv) s.add(v);
  }
  provVertsMap.set(p.code, s);
}

const provinceTones = assignTones(provinces, p => provVertsMap.get(p.code));
const cityTones = new Map();
for (const p of provinces) {
  for (const [k, v] of assignTones(citiesOf(p.code), c => cityVertsMap.get(c.code))) cityTones.set(k, v);
}
const unitTones = new Map();
for (const c of cities) {
  for (const [k, v] of assignTones(unitsOfCity(c.code), u => unitVertsMap.get(u.code))) unitTones.set(k, v);
}

let currentHover = null;   // { type: 'province' | 'city' | 'unit' | 'town', code, isNeighbor }
let currentSelect = null;  // { type: 'unit' | 'town', code }
let currentActive = { viewMode: 'country', provinceCode: null, cityCode: null, countyCode: null };

const getActiveSublinesD = (detail) => {
  const { viewMode, provinceCode, cityCode, countyCode } = currentActive;
  if (viewMode === 'province' && provinceCode) {
    return citiesOf(provinceCode)
      .map(c => (c.single ? getOutline('unit', c.code, detail) : getOutline('city', c.code, detail)))
      .filter(Boolean)
      .join('');
  }
  if (viewMode === 'city' && cityCode) {
    return unitsOfCity(cityCode)
      .map(u => getOutline('unit', u.code, detail))
      .filter(Boolean)
      .join('');
  }
  if (viewMode === 'county' && countyCode) {
    return townsOfUnit(countyCode)
      .map(t => t.d)
      .filter(Boolean)
      .join('');
  }
  return '';
};

const getActiveOutlinesD = (detail) => {
  const { viewMode, provinceCode, cityCode, countyCode } = currentActive;
  if (viewMode === 'province' && provinceCode) {
    return {
      activeD: getOutline('province', provinceCode, detail),
      parentD: '',
    };
  }
  if (viewMode === 'city' && cityCode) {
    const p = provinceByCode.get(provinceCode);
    const isDirect = Boolean(p?.direct);
    return {
      activeD: isDirect ? getOutline('province', provinceCode, detail) : getOutline('city', cityCode, detail),
      parentD: isDirect ? '' : getOutline('province', provinceCode, detail),
    };
  }
  if (viewMode === 'county' && countyCode) {
    const p = provinceByCode.get(provinceCode);
    const c = cityByCode.get(cityCode);
    const parentIsProv = Boolean(p?.direct || c?.single);
    return {
      activeD: getOutline('unit', countyCode, detail),
      parentD: parentIsProv
        ? getOutline('province', provinceCode, detail)
        : cityCode ? getOutline('city', cityCode, detail) : '',
    };
  }
  return { activeD: '', parentD: '' };
};

const syncHighlightLayer = svg => {
  const detail = svg.dataset.detail || 'coarse';

  // 1. 当前进入板块的内部子区域高对比分界线 + 板块整体外框
  const subLayer = svg.querySelector(':scope > .active-sublines');
  if (subLayer) {
    const subD = getActiveSublinesD(detail);
    subLayer.querySelector('.subline-casing')?.setAttribute('d', subD);
    subLayer.querySelector('.subline-stroke')?.setAttribute('d', subD);
  }

  const { activeD, parentD } = getActiveOutlinesD(detail);
  svg.querySelector(':scope > .active-parent-layer > .active-parent-outline')?.setAttribute('d', parentD);

  const activeLayer = svg.querySelector(':scope > .active-layer');
  if (activeLayer) {
    activeLayer.querySelector('.active-shadow')?.setAttribute('d', activeD);
    activeLayer.querySelector('.active-halo')?.setAttribute('d', activeD);
    activeLayer.querySelector('.active-outline')?.setAttribute('d', activeD);
  }

  // 2. 鼠标悬停焦点外框（最高视觉层级）
  const hoverLayer = svg.querySelector(':scope > .hover-layer');
  const hoverGlow = hoverLayer?.querySelector('.hover-glow');
  const hoverHalo = hoverLayer?.querySelector('.hover-halo');
  const hoverOutline = hoverLayer?.querySelector('.hover-outline');
  if (hoverHalo && hoverOutline) {
    const d = currentHover ? getOutline(currentHover.type, currentHover.code, detail) : '';
    hoverGlow?.setAttribute('d', d);
    hoverHalo.setAttribute('d', d);
    hoverOutline.setAttribute('d', d);
    hoverLayer.dataset.neighbor = currentHover?.isNeighbor ? '1' : '';
  }

  // 3. 选中固定外框
  const selLayer = svg.querySelector(':scope > .select-layer');
  const selHalo = selLayer?.querySelector('.select-halo');
  const selOutline = selLayer?.querySelector('.select-outline');
  if (selHalo && selOutline) {
    const d = currentSelect ? getOutline(currentSelect.type, currentSelect.code, detail) : '';
    selHalo.setAttribute('d', d);
    selOutline.setAttribute('d', d);
  }
};

export const setActiveRegion = (svg, state) => {
  currentActive = {
    viewMode: state?.viewMode || 'country',
    provinceCode: state?.provinceCode || null,
    cityCode: state?.cityCode || null,
    countyCode: state?.countyCode || null,
  };
  syncHighlightLayer(svg);
};

export const setHover = (svg, target) => {
  if (
    currentHover?.type === target?.type &&
    currentHover?.code === target?.code &&
    Boolean(currentHover?.isNeighbor) === Boolean(target?.isNeighbor)
  ) return false;
  for (const el of svg.querySelectorAll('.hovered, .hovered-neighbor')) {
    el.classList.remove('hovered', 'hovered-neighbor');
  }
  currentHover = target;
  if (target) {
    const cls = target.isNeighbor ? 'hovered-neighbor' : 'hovered';
    if (target.type === 'province') {
      svg.querySelector(`.prov[data-province="${target.code}"]`)?.classList.add(cls);
    } else if (target.type === 'city') {
      svg.querySelector(`.city[data-city="${target.code}"]`)?.classList.add(cls);
    } else if (target.type === 'unit') {
      for (const node of svg.querySelectorAll(`.unit[data-code="${target.code}"]`)) {
        node.classList.add(cls);
      }
    } else if (target.type === 'town') {
      svg.querySelector(`.town[data-town="${target.code}"]`)?.classList.add(cls);
    }
  }
  syncHighlightLayer(svg);
  return true;
};

export const setSelected = (svg, target) => {
  for (const el of svg.querySelectorAll('.selected')) el.classList.remove('selected');
  currentSelect = target;
  if (target?.type === 'unit') {
    for (const node of svg.querySelectorAll(`.unit[data-code="${target.code}"]`)) {
      node.classList.add('selected');
    }
  } else if (target?.type === 'town') {
    svg.querySelector(`.town[data-town="${target.code}"]`)?.classList.add('selected');
  }
  syncHighlightLayer(svg);
};

// 渲染某区县的乡镇/街道交互区块与外轮廓边界
export const renderCountyTowns = (svg, unitCode) => {
  const townsLayer = svg.querySelector(':scope > .towns-layer');
  const clipPathEl = svg.querySelector('#active-county-clip > path');
  const countyLineEl = svg.querySelector(':scope > .line-county');
  if (!townsLayer || !clipPathEl) return [];
  townsLayer.replaceChildren();
  if (!unitCode) {
    clipPathEl.setAttribute('d', '');
    countyLineEl?.setAttribute('d', '');
    delete svg.dataset.activeUnit;
    return [];
  }
  svg.dataset.activeUnit = unitCode;
  const uPath = unitPath(unitCode) || '';
  clipPathEl.setAttribute('d', uPath);
  countyLineEl?.setAttribute('d', uPath);
  const list = townsOfUnit(unitCode);
  const townTones = assignTones(list, t => extractPathVerts(t.d));
  for (let i = 0; i < list.length; i++) {
    const t = list[i];
    if (!t.d) continue;
    const tone = townTones.get(t.code) ?? (i % TONE_COUNT);
    el('path', {
      class: 'town',
      d: t.d,
      'data-town': t.code,
      'data-unit': unitCode,
      'data-tone': String(tone),
    }, townsLayer);
  }
  return list;
};

// 切换主图（不含插图）区县轮廓与边界线的精度
export const setDetail = (svg, level) => {
  const src = level === 'fine' ? fine : coarse;
  if (!src) return false;
  if (svg.dataset.detail === level) return true;
  svg.dataset.detail = level;
  for (const p of svg.querySelectorAll('.prov .unit')) p.setAttribute('d', src.units[p.dataset.code]);
  svg.querySelector(':scope > .line-city').setAttribute('d', src.lines.city ?? '');
  svg.querySelector(':scope > .line-province').setAttribute('d', src.lines.province);
  svg.querySelector(':scope > .line-country').setAttribute('d', src.lines.country);
  svg.querySelector(':scope > .map-shadow').setAttribute('d', src.outline);
  if (svg.dataset.activeUnit) {
    renderCountyTowns(svg, svg.dataset.activeUnit);
  }
  syncHighlightLayer(svg);
  return true;
};

const el = (tag, attrs = {}, parent) => {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent?.append(node);
  return node;
};

// 按需创建某省的地级市名称标签组（省视图用）
export const ensureProvinceCityLabels = (svg, code) => {
  const labelLayer = svg.querySelector(':scope > .city-labels');
  if (!labelLayer) return null;
  let g = labelLayer.querySelector(`g[data-province="${code}"]`);
  if (g) return g;
  g = el('g', { 'data-province': code }, labelLayer);
  el('g', { class: 'leaders' }, g);
  for (const c of citiesOf(code)) {
    if (!c.label) continue;
    el('text', { x: c.label[0], y: c.label[1], 'data-code': c.code }, g).textContent = c.short;
  }
  return g;
};

// 按需创建某地级市（或直辖市）的区县名称标签组（市视图用）
export const ensureCityUnitLabels = (svg, cityCode) => {
  const labelLayer = svg.querySelector(':scope > .labels');
  if (!labelLayer) return null;
  let g = labelLayer.querySelector(`g[data-city="${cityCode}"]`);
  if (g) return g;
  g = el('g', { 'data-city': cityCode }, labelLayer);
  el('g', { class: 'leaders' }, g);
  for (const u of unitsOfCity(cityCode)) {
    if (!u.label) continue;
    el('text', { x: u.label[0], y: u.label[1], 'data-code': u.code }, g).textContent = u.short;
  }
  return g;
};

// 按需创建某区县的乡镇/街道名称标签组（区县视图用）
export const ensureUnitTownLabels = (svg, unitCode) => {
  const labelLayer = svg.querySelector(':scope > .town-labels');
  if (!labelLayer) return null;
  let g = labelLayer.querySelector(`g[data-unit="${unitCode}"]`);
  if (g) g.remove();
  g = el('g', { 'data-unit': unitCode, class: 'active' }, labelLayer);
  el('g', { class: 'leaders' }, g);
  for (const t of townsOfUnit(unitCode)) {
    if (!t.label) continue;
    el('text', { x: t.label[0], y: t.label[1], 'data-code': t.code }, g).textContent = t.short;
  }
  return g;
};

// 构建地图
export const buildMap = (svg, { withLabels = true } = {}) => {
  svg.setAttribute('viewBox', FULL_VIEW.join(' '));
  svg.innerHTML = '';

  const defs = el('defs', {}, svg);
  const countyClip = el('clipPath', { id: 'active-county-clip' }, defs);
  el('path', { d: '' }, countyClip);

  const [vx, vy, vw, vh] = FULL_VIEW;
  el('rect', { class: 'sea', x: vx - vw, y: vy - vh, width: vw * 3, height: vh * 3 }, svg);
  // 卡片投影：全国外轮廓的偏移副本
  el('path', { class: 'map-shadow', d: data.outline }, svg);

  const provLayer = el('g', { class: 'provinces' }, svg);
  const provGroups = new Map();
  for (let i = 0; i < provinces.length; i++) {
    const p = provinces[i];
    const tone = provinceTones.get(p.code) ?? (i % TONE_COUNT);
    provGroups.set(p.code, el('g', {
      class: 'prov',
      'data-province': p.code,
      'data-tone': String(tone),
    }, provLayer));
  }
  const cityGroups = new Map();
  for (let i = 0; i < cities.length; i++) {
    const c = cities[i];
    const tone = cityTones.get(c.code) ?? (i % TONE_COUNT);
    cityGroups.set(c.code, el('g', {
      class: 'city',
      'data-city': c.code,
      'data-tone': String(tone),
    }, provGroups.get(c.province)));
  }
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u.d) continue; // 三沙只出现在插图中
    const tone = unitTones.get(u.code) ?? (i % TONE_COUNT);
    el('path', {
      class: 'unit',
      d: u.d,
      'data-code': u.code,
      'data-tone': String(tone),
    }, cityGroups.get(u.city));
  }

  // 四级乡镇/街道图层（区县视图下激活，裁剪于当前区县轮廓内）
  el('g', { class: 'towns-layer', 'clip-path': 'url(#active-county-clip)' }, svg);
  el('path', { class: 'line-county', d: '' }, svg);

  el('path', { class: 'line-city', d: data.lines.city ?? '' }, svg);
  el('path', { class: 'line-province', d: data.lines.province }, svg);
  el('path', { class: 'line-country', d: data.lines.country }, svg);

  // 上级参考轮廓层（市视图下的所属省外框、区县视图下的所属市外框）
  const parentLayer = el('g', { class: 'active-parent-layer' }, svg);
  el('path', { class: 'active-parent-outline' }, parentLayer);

  // 当前激活板块内部的子区域高对比分界线层（省内各市边界、市内各区县边界、区县内各乡镇边界）
  const sublinesLayer = el('g', { class: 'active-sublines' }, svg);
  el('path', { class: 'subline-casing' }, sublinesLayer);
  el('path', { class: 'subline-stroke' }, sublinesLayer);

  // 当前激活板块整体外围轮廓层（使当前进入的省/市/区县整体与其他板块形成强烈区分）
  const activeLayer = el('g', { class: 'active-layer' }, svg);
  el('path', { class: 'active-shadow' }, activeLayer);
  el('path', { class: 'active-halo' }, activeLayer);
  el('path', { class: 'active-outline' }, activeLayer);

  // 选中与悬停外圈高亮图层（位于所有边界线之上、文字标签之下，确保鼠标悬停块成为最高视觉焦点）
  const selLayer = el('g', { class: 'select-layer' }, svg);
  el('path', { class: 'select-halo' }, selLayer);
  el('path', { class: 'select-outline' }, selLayer);

  const hoverLayer = el('g', { class: 'hover-layer' }, svg);
  el('path', { class: 'hover-glow' }, hoverLayer);
  el('path', { class: 'hover-halo' }, hoverLayer);
  el('path', { class: 'hover-outline' }, hoverLayer);

  if (withLabels) {
    // 省名：全国视图显示
    const provLabels = el('g', { class: 'prov-labels' }, svg);
    for (const p of provinces) {
      el('text', { x: p.label[0], y: p.label[1], 'data-province': p.code }, provLabels).textContent = p.short;
    }
    // 地级市名容器：省视图下由 ensureProvinceCityLabels 按需填充
    el('g', { class: 'city-labels' }, svg);
    // 区县名容器：市视图下由 ensureCityUnitLabels 按需填充
    el('g', { class: 'labels' }, svg);
    // 乡镇/街道名容器：区县视图下由 ensureUnitTownLabels 按需填充
    el('g', { class: 'town-labels' }, svg);
  }

  // 南海诸岛插图：迷你卡片
  const [bx, by, bw, bh] = data.inset.box;
  const box = { x: bx, y: by, width: bw, height: bh, rx: INSET_RADIUS };
  const inset = el('g', { class: 'inset' }, svg);
  const clipId = `inset-clip-${Math.random().toString(36).slice(2, 8)}`;
  el('rect', box, el('clipPath', { id: clipId }, inset));
  el('rect', { class: 'inset-shadow', ...box }, inset);
  el('rect', { class: 'inset-bg', ...box }, inset);
  const clipped = el('g', { 'clip-path': `url(#${clipId})` }, inset);
  for (const u of data.inset.units) {
    el('path', { class: 'unit', d: u.d, 'data-code': u.code }, clipped);
  }
  el('path', { class: 'line-province', d: data.inset.province }, clipped);
  el('path', { class: 'line-country', d: data.inset.country }, clipped);
  el('path', { class: 'jd', d: data.inset.jd }, clipped);
  el('rect', { class: 'inset-frame', ...box }, inset);
  el('text', { class: 'inset-title', x: bx + bw - 7, y: by + bh - 7 }, inset).textContent = '南海诸岛';

  return svg;
};

// 三沙卡片（海南省/三沙市视图用）：南海插图的内容
export const buildSanshaCard = svg => {
  const [bx, by, bw, bh] = data.inset.box;
  svg.setAttribute('viewBox', `${bx} ${by} ${bw} ${bh}`);
  svg.innerHTML = '';
  for (const u of data.inset.units) {
    el('path', isSansha(u.code)
      ? { class: 'unit sansha', d: u.d, 'data-code': u.code }
      : { class: 'land', d: u.d }, svg);
  }
  el('path', { class: 'jd', d: data.inset.jd }, svg);
};

// k：当前视图下每像素对应的 viewBox 单位。投影偏移按它换算成固定像素
export const setScale = (svg, k) => svg.style.setProperty('--k', k);

// ---------- 缩放 ----------
let rectCache = null;
addEventListener('resize', () => { rectCache = null; });
const rectOf = svg => (svg.isConnected ? (rectCache ??= svg.getBoundingClientRect()) : svg.getBoundingClientRect());
export const svgRect = rectOf;

export const boxView = (bbox, pad = 0.08) => {
  const [x0, y0, x1, y1] = bbox;
  const w = x1 - x0, h = y1 - y0;
  const m = Math.max(w, h) * pad;
  return [x0 - m, y0 - m, w + m * 2, h + m * 2];
};

export const provinceView = (code, pad = 0.08) => boxView(provinceByCode.get(code).bbox, pad);
export const cityView = (code, pad = 0.08) => {
  const c = cityByCode.get(code);
  return boxView(c.bbox ?? provinceByCode.get(c.province).bbox, pad);
};
export const unitView = (code, pad = 0.12) => {
  const u = unitByCode.get(code);
  return boxView(u.bbox ?? cityByCode.get(u.city)?.bbox ?? provinceByCode.get(u.province).bbox, pad);
};

// 让 box 落在屏幕上扣除 inset（像素，被标题栏、面板遮住的部分）后的可见区域中央，返回整个 svg 对应的 viewBox
export const fitView = (svg, box, { top = 0, right = 0, bottom = 0, left = 0 } = {}) => {
  const { width: W, height: H } = rectOf(svg);
  const aw = Math.max(1, W - left - right), ah = Math.max(1, H - top - bottom);
  const s = Math.min(aw / box[2], ah / box[3]); // 像素 / 单位
  const x = box[0] - (left + (aw - box[2] * s) / 2) / s;
  const y = box[1] - (top + (ah - box[3] * s) / 2) / s;
  return [x, y, W / s, H / s];
};

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
let animation = 0;

export const stopAnimation = () => cancelAnimationFrame(animation);

export const currentView = svg => svg.getAttribute('viewBox').split(' ').map(Number);

export const animateView = (svg, to, duration = 650, onFrame = null) => new Promise(resolve => {
  cancelAnimationFrame(animation);
  const from = currentView(svg);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) duration = 0;
  const start = performance.now();
  const step = now => {
    const t = duration ? Math.min(1, (now - start) / duration) : 1;
    const k = ease(t);
    const view = from.map((v, i) => v + (to[i] - v) * k);
    svg.setAttribute('viewBox', view.join(' '));
    onFrame?.(view);
    if (t < 1) animation = requestAnimationFrame(step);
    else resolve();
  };
  animation = requestAnimationFrame(step);
});

export const unitsPerPixel = (svg, view = currentView(svg)) => {
  const { width, height } = rectOf(svg);
  return Math.max(view[2] / width, view[3] / height);
};
