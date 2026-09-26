// data/raw/*.json → src/map-data.json（全国视图用的粗略版 + 元数据）、src/map-fine.json（省/市视图用的精细版）
// 拓扑化简化（mapshaper）→ Albers 投影 → SVG path 字符串 + 标签点 + 省/市范围 + 南海诸岛插图
import { readFile, writeFile } from 'node:fs/promises';
import mapshaper from 'mapshaper';
import { geoConicEqualArea, geoArea, geoCentroid } from 'd3-geo';
import * as topojson from 'topojson-client';
import polylabel from 'polylabel';
import { SINGLE_UNIT, isSansha, shortName, toPinyin } from './config.mjs';

const RAW = new URL('../data/raw/', import.meta.url);
const OUT = new URL('../src/map-data.json', import.meta.url);
const OUT_FINE = new URL('../src/map-fine.json', import.meta.url);
const TOWNS_FILE = new URL('../src/towns-data.json', import.meta.url);
const readJSON = async name => JSON.parse(await readFile(new URL(name, RAW), 'utf8'));
const townsData = JSON.parse(await readFile(TOWNS_FILE, 'utf8'));

const WIDTH = 1000;          // 全国视图 viewBox 宽度
const PAD = 16;
// 两个精度层级：simplify 为 mapshaper 保留的顶点比例；minIsland 为保留小岛的最小面积（viewBox 单位²，全国视图 1 单位约 1 像素）
const DETAIL = {
  coarse: { simplify: process.env.COARSE ?? '2.5%', minIsland: +(process.env.MIN_ISLAND ?? 1) }, // 全国视图
  fine: { simplify: '8%', minIsland: 0.005 },                                                    // 省/市视图、全国视图放大后
};
// 无论多小都保留的岛：钓鱼岛及其附属岛屿（三沙整体在插图中绘制，另行处理）
const ALWAYS_KEEP = [[123.3, 25.6, 124.7, 26.0]];
// 南海诸岛插图覆盖的经纬度范围
const INSET_LONLAT = [[106.5, 3], [122.5, 24.5]];
const INSET_WIDTH = 150;
// 直辖市与港澳：不设地级市层，点击省份直接进入区县标记视图
const DIRECT_PROV = new Set(['110000', '120000', '310000', '500000', '810000', '820000']);
const SANSHA_CITY = '460300';

// ---------- 1. 汇总省份、地级市与区县标记单位 ----------
const china = await readJSON('100000_full.json');
const provinces = [];
let jd = null;
for (const f of china.features) {
  const code = String(f.properties.adcode);
  if (code === '100000_JD') { jd = f; continue; }
  const single = SINGLE_UNIT.includes(code);
  const direct = DIRECT_PROV.has(code) && !single;
  const short = shortName(code, f.properties.name);
  provinces.push({ code, name: f.properties.name, short, single, ...(direct ? { direct: true } : {}), ...toPinyin(short) });
}

const rawCities = await readJSON('100000_full_city.json');
const cityMeta = new Map();
for (const p of provinces) {
  if (p.direct || p.single) {
    cityMeta.set(p.code, { code: p.code, name: p.name, short: p.short, province: p.code, single: p.single, ...toPinyin(p.short) });
  }
}
for (const f of rawCities.features) {
  const code = String(f.properties.adcode);
  if (!/^\d{6}$/.test(code) || code === '100000') continue;
  const province = code.slice(0, 2) + '0000';
  if (DIRECT_PROV.has(province)) continue;
  const short = shortName(code, f.properties.name);
  cityMeta.set(code, { code, name: f.properties.name, short, province, single: false, ...toPinyin(short) });
}

const units = [];
for (const p of provinces) {
  if (p.single) {
    const pf = rawCities.features.find(f => String(f.properties.adcode) === p.code);
    units.push({
      type: 'Feature',
      properties: { code: p.code, name: p.name, province: p.code, city: p.code, meshCity: p.code },
      geometry: pf.geometry,
    });
    continue;
  }
  const dfc = await readJSON(`districts/${p.code}.json`);
  for (const f of dfc.features) {
    const code = String(f.properties.adcode);
    if (!/^\d{6}$/.test(code)) continue;
    const parent = String(f.properties.parent?.adcode ?? p.code);
    let city = parent;
    let meshCity = parent;
    if (!p.direct) {
      if (parent === p.code) {
        // 省直辖县级行政单位或不设区的地级市（如东莞、中山、儋州、嘉峪关、济源、仙桃、海南直辖县、新疆兵团市）
        city = code;
        meshCity = code;
        const short = shortName(code, f.properties.name);
        cityMeta.set(code, { code, name: f.properties.name, short, province: p.code, single: true, ...toPinyin(short) });
      } else if (!cityMeta.has(parent)) {
        const short = shortName(parent, f.properties.name);
        cityMeta.set(parent, { code: parent, name: f.properties.name, short, province: p.code, single: false, ...toPinyin(short) });
      }
    } else {
      city = p.code;
      meshCity = p.code;
    }
    units.push({
      type: 'Feature',
      properties: { code, name: f.properties.name, province: p.code, city, meshCity },
      geometry: f.geometry,
    });
  }
}

// 过滤掉没有任何下属区县的空城市条目
const usedCities = new Set(units.map(u => u.properties.city));
const cities = [...cityMeta.values()].filter(c => usedCities.has(c.code));

// ---------- 2. 合并 + 拓扑化简化 ----------
const levels = {};
for (const name of ['fine', 'coarse']) {
  const out = await mapshaper.applyCommands(
    `-i units.json snap -clean -dissolve code copy-fields=name,province,city,meshCity`
    + ` -simplify weighted ${DETAIL[name].simplify} keep-shapes -clean -o ${name}.json format=topojson`,
    { 'units.json': { type: 'FeatureCollection', features: units } },
  );
  const topo = JSON.parse(out[`${name}.json`]);
  topo.objects.units = topo.objects.units ?? Object.values(topo.objects)[0];
  levels[name] = { topo, obj: topo.objects.units, fc: topojson.feature(topo, topo.objects.units) };
}
// 投影、标签、省/市范围、插图位置都以精细版为准
const { topo, obj, fc } = levels.fine;

// ---------- 3. 投影 ----------
const raw = geoConicEqualArea().parallels([25, 47]).rotate([-105, 0]).scale(1).translate([0, 0]);

const eachPoint = (geom, fn) => {
  const walk = c => (typeof c[0] === 'number' ? fn(c) : c.forEach(walk));
  walk(geom.coordinates);
};
const boundsOf = (geoms, proj) => {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const g of geoms) eachPoint(g, p => {
    const [x, y] = proj(p);
    if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y;
    if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y;
  });
  return b;
};
const affine = (b, x0, y0, w) => {
  const k = w / (b[2] - b[0]);
  return p => { const [x, y] = raw(p); return [x0 + (x - b[0]) * k, y0 + (y - b[1]) * k]; };
};

// 全国视图：排除三沙
const mainGeoms = fc.features.filter(f => !isSansha(f.properties.code)).map(f => f.geometry);
const mainRaw = boundsOf(mainGeoms, raw);
const main = affine(mainRaw, PAD, PAD, WIDTH - PAD * 2);
let HEIGHT = Math.ceil(PAD * 2 + (mainRaw[3] - mainRaw[1]) * (WIDTH - PAD * 2) / (mainRaw[2] - mainRaw[0]));

// 插图：放在右下角
const [[lo0, la0], [lo1, la1]] = INSET_LONLAT;
const insetFrame = { type: 'LineString', coordinates: [] };
for (let i = 0; i <= 20; i++) {
  const t = i / 20;
  insetFrame.coordinates.push([lo0 + (lo1 - lo0) * t, la0], [lo0 + (lo1 - lo0) * t, la1], [lo0, la0 + (la1 - la0) * t], [lo1, la0 + (la1 - la0) * t]);
}
const polysOf = g => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const insetRaw = boundsOf([insetFrame], raw);
const INSET_HEIGHT = INSET_WIDTH * (insetRaw[3] - insetRaw[1]) / (insetRaw[2] - insetRaw[0]);
const twMain = {
  type: 'MultiPolygon',
  coordinates: fc.features
    .filter(f => f.properties.province === '710000')
    .flatMap(f => polysOf(f.geometry))
    .filter(p => p[0].some(([, la]) => la > 21.5)),
};
const taiwanBottom = boundsOf([twMain], main)[3];
const insetTop = Math.max(HEIGHT - PAD - INSET_HEIGHT, taiwanBottom + 12);
HEIGHT = Math.ceil(Math.max(HEIGHT, insetTop + INSET_HEIGHT + PAD));
const insetBox = [WIDTH - PAD - INSET_WIDTH, insetTop, INSET_WIDTH, INSET_HEIGHT];
const inset = affine(insetRaw, insetBox[0], insetBox[1], INSET_WIDTH);
const inInset = geom => {
  let hit = false;
  eachPoint(geom, ([lo, la]) => { if (lo >= lo0 && lo <= lo1 && la >= la0 && la <= la1) hit = true; });
  return hit;
};

// ---------- 3.5 补回简化时丢失的小岛 ----------
const ringBox = ring => boundsOf([{ coordinates: ring }], p => p);
const iou = (a, b) => {
  const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  if (w <= 0 || h <= 0) return 0;
  const area = r => (r[2] - r[0]) * (r[3] - r[1]);
  return (w * h) / (area(a) + area(b) - w * h);
};
const rawPolys = new Map();
for (const u of units) {
  const list = rawPolys.get(u.properties.code) ?? [];
  list.push(...polysOf(u.geometry));
  rawPolys.set(u.properties.code, list);
}
const thin = (ring, proj, minDist = 0.25) => {
  let last = null;
  const out = ring.filter((c, i) => {
    const p = proj(c);
    if (last && i < ring.length - 1 && Math.hypot(p[0] - last[0], p[1] - last[1]) < minDist) return false;
    last = p;
    return true;
  });
  return out.length >= 4 ? out : ring;
};
const inRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const ringArea = ring => {
  let a = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return Math.abs(a / 2);
};
const alwaysKeep = ring => ring.some(([lo, la]) => ALWAYS_KEEP.some(b => lo >= b[0] && lo <= b[2] && la >= b[1] && la <= b[3]));

const fixIslands = (features, minIsland) => {
  let restoredCount = 0, droppedCount = 0;
  for (const f of features) {
    const { code, province } = f.properties;
    const simplified = polysOf(f.geometry);
    const boxes = simplified.map(p => ringBox(p[0]));
    const proj = isSansha(code) ? inset : main;
    const gridScale = (province === '810000' || province === '820000') ? 200 : 20;
    const restored = rawPolys.get(code)
      .filter(p => {
        const b = ringBox(p[0]);
        if (boxes.some(sb => iou(sb, b) > 0.3)) return false;
        const pt = polylabel(p, 1e-3);
        return !simplified.some(sp => inRing(pt, sp[0]));
      })
      .filter(p => new Set(p[0].map(c => proj(c).map(v => Math.round(v * gridScale)).join())).size >= 3)
      .map(p => [thin(p[0], proj, province === '810000' || province === '820000' ? 0.02 : 0.25)]);
    restoredCount += restored.length;
    let parts = [...simplified, ...restored];
    if (!isSansha(code)) {
      const areas = parts.map(p => ringArea(p[0].map(main)));
      const max = Math.max(...areas);
      const effMin = (province === '810000' || province === '820000') ? Math.min(minIsland, 0.0005) : minIsland;
      const kept = parts.filter((p, i) => areas[i] === max || areas[i] >= effMin || alwaysKeep(p[0]));
      droppedCount += parts.length - kept.length;
      parts = kept;
    }
    f.geometry = { type: 'MultiPolygon', coordinates: parts };
  }
  return { restoredCount, droppedCount };
};
const islandStats = Object.fromEntries(Object.entries(levels).map(([name, l]) => [name, fixIslands(l.fc.features, DETAIL[name].minIsland)]));

// ---------- 4. 生成 SVG path ----------
const r1 = v => Math.round(v * 10) / 10;
const r2 = v => Math.round(v * 100) / 100;

const lineToD = (coords, proj, close, scale = 10) => {
  const build = s => {
    let d = '', px, py, pts = 0;
    for (const c of coords) {
      const [x, y] = proj(c).map(v => Math.round(v * s));
      if (d && x === px && y === py) continue;
      d += d ? `l${Math.round(x - px) / s} ${Math.round(y - py) / s}` : `M${x / s} ${y / s}`;
      px = x; py = y; pts++;
    }
    return { d: d + (close ? 'z' : ''), pts };
  };
  let res = build(scale);
  if (close && res.pts < 3 && scale < 200) res = build(200);
  return res.d;
};

const toD = (geom, proj, scale = 10) => {
  const polys = geom.type === 'Polygon' ? [geom.coordinates]
    : geom.type === 'MultiPolygon' ? geom.coordinates : null;
  if (polys) return polys.flat().map(ring => lineToD(ring, proj, true, scale)).join('');
  const lines = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
  return lines.map(l => lineToD(l, proj, false, scale)).join('');
};

const projPolys = (geom, proj) => (geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates)
  .map(poly => poly.map(ring => ring.map(proj)));

const fineScaleOf = provCode => (provCode === '810000' || provCode === '820000' ? 400
  : DIRECT_PROV.has(provCode) || provCode === '710000' ? 100 : 20);

const EARTH_R2 = 6371 * 6371;
const calcAreaKm2 = geom => Math.max(1, Math.round(geoArea(geom) * EARTH_R2));

// 省与地级市范围（缩放目标）与标签标注点
const mainParts = geom => {
  const polys = polysOf(geom);
  const areas = polys.map(p => ringArea(p[0].map(main)));
  const max = Math.max(...areas);
  return { type: 'MultiPolygon', coordinates: polys.filter((_, i) => areas[i] >= max * 0.01) };
};

const coarseByCode = new Map(levels.coarse.fc.features.map(f => [f.properties.code, f]));
const unitsOut = fc.features.map(f => {
  const { code, name, province, city } = f.properties;
  const polys = projPolys(f.geometry, main);
  const largest = polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
  const label = polylabel(largest, 0.05).map(r2);
  const bbox = boundsOf([mainParts(f.geometry)], main).map(r2);
  const short = shortName(code, name);
  const area = calcAreaKm2(f.geometry);
  const center = geoCentroid(f.geometry).map(r2);
  const towns = (townsData[code] ?? []).length;
  return {
    code, name, short, province, city,
    ...toPinyin(short),
    d: isSansha(code) ? '' : toD(coarseByCode.get(code).geometry, main, 10),
    label: isSansha(code) ? null : label,
    bbox,
    area,
    center,
    towns,
  };
});

for (const p of provinces) {
  const geoms = fc.features.filter(f => f.properties.province === p.code && !isSansha(f.properties.code)).map(f => mainParts(f.geometry));
  p.bbox = boundsOf(geoms, main).map(r2);
  const merged = topojson.merge(topo, obj.geometries.filter(g => g.properties.province === p.code && !isSansha(g.properties.code)));
  const polys = projPolys(merged, main);
  const largest = polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
  p.label = polylabel(largest, 0.2).map(r1);
  const pUnits = unitsOut.filter(u => u.province === p.code);
  p.area = pUnits.reduce((s, u) => s + (u.area || 0), 0);
  p.center = geoCentroid(merged).map(r2);
  p.towns = pUnits.reduce((s, u) => s + (u.towns || 0), 0);
}
for (const c of cities) {
  const cUnits = unitsOut.filter(u => u.city === c.code);
  c.area = cUnits.reduce((s, u) => s + (u.area || 0), 0);
  c.towns = cUnits.reduce((s, u) => s + (u.towns || 0), 0);
  if (c.code === SANSHA_CITY) {
    c.bbox = null;
    c.label = null;
    c.center = [112.35, 16.83];
    continue;
  }
  const cGeoms = obj.geometries.filter(g => g.properties.city === c.code && !isSansha(g.properties.code));
  const merged = topojson.merge(topo, cGeoms);
  const cleaned = mainParts(merged);
  c.bbox = boundsOf([cleaned], main).map(r2);
  const polys = projPolys(cleaned, main);
  const largest = polys.reduce((a, b) => (ringArea(b[0]) > ringArea(a[0]) ? b : a));
  c.label = polylabel(largest, 0.1).map(r2);
  c.center = geoCentroid(cleaned).map(r2);
}

// ---------- 5. 边界线（县界由各区县 path 自身描边绘制；市界、省界、国界单独提取）----------
const prov = f => f.properties.province;
const mcity = f => f.properties.meshCity;
const keepLines = (ml, test) => ({ type: 'MultiLineString', coordinates: ml.coordinates.filter(l => test({ type: 'LineString', coordinates: l })) });
const notSansha = (() => {
  const sGeoms = fc.features.filter(f => isSansha(f.properties.code)).map(f => f.geometry);
  const sb = boundsOf(sGeoms, p => p);
  return l => { let out = false; eachPoint(l, ([lo, la]) => { if (lo < sb[0] || lo > sb[2] || la > sb[3]) out = true; }); return out; };
})();
const TINY = ['810000', '820000'];
const tiny = f => TINY.includes(f.properties.province);
const meshes = ({ topo, obj }, tinyCoast = false) => ({
  city: topojson.mesh(topo, obj, (a, b) => a !== b && prov(a) === prov(b) && mcity(a) !== mcity(b)),
  province: topojson.mesh(topo, obj, (a, b) => (a !== b && prov(a) !== prov(b)) || (tinyCoast && a === b && tiny(a))),
  country: topojson.mesh(topo, obj, (a, b) => a === b && !(tinyCoast && tiny(a))),
});
const isDegenerate = l => l.length > 2 && l[0][0] === l.at(-1)[0] && l[0][1] === l.at(-1)[1] && ringArea(l) < 1e-6;
const dropDegenerate = ml => ({ type: 'MultiLineString', coordinates: ml.coordinates.filter(l => !isDegenerate(l)) });
const linesOf = (level, tinyCoast = false, scale = 10, includeCity = true) => {
  const m = meshes(level, tinyCoast);
  return {
    ...(includeCity ? { city: toD(dropDegenerate(m.city), main, scale) } : {}),
    province: toD(dropDegenerate(m.province), main, scale),
    country: toD(dropDegenerate(keepLines(m.country, notSansha)), main, scale),
  };
};
const coarseMesh = meshes(levels.coarse);
const outlineOf = ({ topo, obj }, scale = 10) => toD(topojson.merge(topo, obj.geometries.filter(g => !isSansha(g.properties.code))), main, scale);

const insetUnits = levels.coarse.fc.features.filter(f => inInset(f.geometry))
  .map(f => ({ code: f.properties.code, d: toD(f.geometry, inset, 10) }));

const data = {
  viewBox: [0, 0, WIDTH, HEIGHT],
  provinces,
  cities,
  units: unitsOut,
  lines: linesOf(levels.coarse, true, 10, false),
  outline: outlineOf(levels.coarse, 10),
  jd: toD(jd.geometry, main, 10),
  inset: {
    box: insetBox.map(r1),
    units: insetUnits,
    province: toD(keepLines(coarseMesh.province, inInset), inset, 10),
    country: toD(keepLines(coarseMesh.country, inInset), inset, 10),
    jd: toD(jd.geometry, inset, 10),
  },
};

const fine = {
  units: Object.fromEntries(
    fc.features
      .filter(f => !isSansha(f.properties.code))
      .map(f => [f.properties.code, toD(f.geometry, main, fineScaleOf(f.properties.province))]),
  ),
  lines: linesOf(levels.fine, false, 20, true),
  outline: outlineOf(levels.fine, 20),
};

const json = JSON.stringify(data);
const fineJson = JSON.stringify(fine);
await writeFile(OUT, json);
await writeFile(OUT_FINE, fineJson);
for (const [name, st] of Object.entries(islandStats)) {
  console.log(`${name} (${DETAIL[name].simplify}): restored ${st.restoredCount} islands, dropped ${st.droppedCount} below ${DETAIL[name].minIsland}`);
}
console.log(`units: ${unitsOut.length}, cities: ${cities.length}, provinces: ${provinces.length}, inset units: ${insetUnits.length}`);
console.log(`viewBox: ${data.viewBox.join(' ')}, map-data: ${(json.length / 1024).toFixed(0)} KB, map-fine: ${(fineJson.length / 1024).toFixed(0)} KB`);
