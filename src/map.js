// SVG 地图：构建 DOM（省/市/区县/乡镇四级）、外边缘高亮提取、乡镇真实坐标分区、viewBox 缩放动画
// @author ygw
import data from './map-data.json';
import { outerBoundaryD } from './geometry.js';
import { TONE_COUNT, extractPathVerts, assignTones } from './topo-color.js';
import { SET_DETAIL_BATCH } from './constants.js';
import { computeTownCells } from './voronoi-core.js';

const NS = 'http://www.w3.org/2000/svg';
const INSET_RADIUS = 6; // 南海插图卡片圆角（viewBox 单位，全国视图下约 5～8px）

// 粗精度路径独立 chunk，与元数据并行下载后合并到 units
const pathData = (await import('./map-paths-coarse.json')).default;
for (const u of data.units) {
  if (pathData[u.code]) u.d = pathData[u.code];
}

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

/** 已加载的乡镇数据（按区县码合并） */
let rawTowns = null;
/** 省级分片加载 Promise：prefix -> Promise */
const townsProvPromises = new Map();
/** 搜索索引（轻量，按需加载） */
let townsIndex = null;
let townsIndexPromise = null;

/**
 * 按省级前缀加载乡镇分片并合并到 rawTowns
 * @param {string} provinceOrUnitCode - 6 位省/市/区县代码
 * @returns {Promise<object>} 该省分片数据
 */
export const loadTownsForProvince = provinceOrUnitCode => {
  const prefix = String(provinceOrUnitCode).slice(0, 2);
  if (townsProvPromises.has(prefix)) return townsProvPromises.get(prefix);
  const p = import(`./towns/${prefix}.json`).then(m => {
    const shard = m.default;
    rawTowns = rawTowns ? { ...rawTowns, ...shard } : { ...shard };
    return shard;
  });
  townsProvPromises.set(prefix, p);
  return p;
};

/**
 * 兼容旧接口：加载全部省级分片（仅搜索全量乡镇时使用）
 * @returns {Promise<object>}
 */
export const loadTowns = async () => {
  const prefixes = [...new Set(provinces.map(p => p.code.slice(0, 2)))];
  await Promise.all(prefixes.map(loadTownsForProvince));
  return rawTowns;
};

/**
 * 加载乡镇搜索索引（无坐标，按需）
 * @returns {Promise<Array>}
 */
export const loadTownsIndex = () => townsIndexPromise ??= import('./towns-index.json').then(m => {
  townsIndex = m.default;
  return townsIndex;
});

export const hasTowns = () => rawTowns !== null;
export const getRawTowns = () => rawTowns;
export const getTownsIndex = () => townsIndex;

// 某区县当前可用的最精细轮廓（地图坐标）
export const unitPath = code => fine?.units[code] ?? coarse.units[code];
// 某地级市当前可用的合并轮廓（省视图下用于地级市名称避让布局）
export const cityPath = code => unitsOfCity(code).map(u => unitPath(u.code)).filter(Boolean).join('');

// ---------- 四级乡镇/街道真实坐标辖区剖分 ----------

const COUNTY_TOWNS_CACHE_MAX = 80;
const countyTownsCache = new Map(); // unitCode -> { detail, list }
const townByCode = new Map();
let countySubDCache = null; // { code, detail, d } 区县内乡镇分界线拼接缓存

const touchCountyCache = (unitCode, entry) => {
  if (countyTownsCache.has(unitCode)) countyTownsCache.delete(unitCode);
  countyTownsCache.set(unitCode, entry);
  while (countyTownsCache.size > COUNTY_TOWNS_CACHE_MAX) {
    const oldest = countyTownsCache.keys().next().value;
    countyTownsCache.delete(oldest);
  }
};

export const getTownByCode = code => {
  if (townByCode.has(code)) return townByCode.get(code);
  const unitCode = code.slice(0, 6);
  if (unitByCode.has(unitCode)) {
    townsOfUnit(unitCode);
    return townByCode.get(code) ?? null;
  }
  return null;
};

/** 乡镇数超过该阈值时走 Web Worker，避免主线程尖峰 */
const VORONOI_WORKER_THRESHOLD = 12;
let voronoiWorker = null;
let voronoiReqId = 0;
const voronoiPending = new Map();

/**
 * 获取（懒创建）Voronoi Worker
 * @returns {Worker|null}
 */
const getVoronoiWorker = () => {
  if (typeof Worker === 'undefined') return null;
  if (voronoiWorker) return voronoiWorker;
  try {
    voronoiWorker = new Worker(new URL('./voronoi.worker.js', import.meta.url), { type: 'module' });
    voronoiWorker.onmessage = e => {
      const { id, ok, list, error } = e.data || {};
      const pending = voronoiPending.get(id);
      if (!pending) return;
      voronoiPending.delete(id);
      if (ok) pending.resolve(list);
      else pending.reject(new Error(error || 'voronoi worker failed'));
    };
    voronoiWorker.onerror = () => {
      for (const [, p] of voronoiPending) p.reject(new Error('voronoi worker error'));
      voronoiPending.clear();
      voronoiWorker = null;
    };
  } catch {
    voronoiWorker = null;
  }
  return voronoiWorker;
};

/**
 * 将计算结果写入缓存与 townByCode
 * @param {string} unitCode
 * @param {Array} list
 * @returns {Array}
 */
const storeTownList = (unitCode, list) => {
  for (const t of list) townByCode.set(t.code, t);
  touchCountyCache(unitCode, { detail: fine ? 'fine' : 'coarse', list });
  countySubDCache = null;
  return list;
};

/**
 * 同步计算乡镇 Voronoi（缓存命中或 Worker 不可用时）
 * @param {string} unitCode
 * @returns {Array}
 */
export const townsOfUnit = unitCode => {
  const cached = countyTownsCache.get(unitCode);
  if (cached && cached.detail === (fine ? 'fine' : 'coarse')) return cached.list;
  const u = unitByCode.get(unitCode);
  if (!u || !rawTowns) return [];
  const entries = rawTowns[unitCode] ?? [];
  if (!entries.length) return [];
  const list = computeTownCells({
    pathD: unitPath(unitCode),
    entries,
    meta: { code: u.code, city: u.city, province: u.province, area: u.area, bbox: u.bbox, center: u.center, seat: u.seat },
  });
  return storeTownList(unitCode, list);
};

/**
 * 异步预计算乡镇分区：大区县走 Web Worker，小区县同步完成
 * @param {string} unitCode
 * @returns {Promise<Array>}
 */
export const ensureTownsOfUnit = async unitCode => {
  const cached = countyTownsCache.get(unitCode);
  if (cached && cached.detail === (fine ? 'fine' : 'coarse')) return cached.list;
  const u = unitByCode.get(unitCode);
  if (!u || !rawTowns) return [];
  const entries = rawTowns[unitCode] ?? [];
  if (!entries.length) return [];

  const meta = { code: u.code, city: u.city, province: u.province, area: u.area, bbox: u.bbox, center: u.center, seat: u.seat };
  const pathD = unitPath(unitCode);
  const worker = entries.length >= VORONOI_WORKER_THRESHOLD ? getVoronoiWorker() : null;

  if (worker) {
    const id = ++voronoiReqId;
    try {
      const list = await new Promise((resolve, reject) => {
        voronoiPending.set(id, { resolve, reject });
        worker.postMessage({ id, pathD, entries, meta });
      });
      return storeTownList(unitCode, list);
    } catch {
      // Worker 失败时回退主线程
    }
  }
  return townsOfUnit(unitCode);
};

export const townPath = code => getTownByCode(code)?.d ?? '';

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

const unitVertsMap = new Map();
for (const u of units) unitVertsMap.set(u.code, extractPathVerts(u.d));

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

/** 高亮层 DOM 引用缓存，避免每次 sync 全树 querySelector */
let highlightRefs = null;

/**
 * 绑定当前 SVG 的高亮层节点引用（buildMap 后调用）
 * @param {SVGSVGElement} svg
 */
const bindHighlightRefs = svg => {
  const subLayer = svg.querySelector(':scope > .active-sublines');
  const activeLayer = svg.querySelector(':scope > .active-layer');
  const hoverLayer = svg.querySelector(':scope > .hover-layer');
  const selLayer = svg.querySelector(':scope > .select-layer');
  highlightRefs = {
    svg,
    subLayer,
    subCasing: subLayer?.querySelector('.subline-casing'),
    subStroke: subLayer?.querySelector('.subline-stroke'),
    parentOutline: svg.querySelector(':scope > .active-parent-layer > .active-parent-outline'),
    activeShadow: activeLayer?.querySelector('.active-shadow'),
    activeHalo: activeLayer?.querySelector('.active-halo'),
    activeOutline: activeLayer?.querySelector('.active-outline'),
    hoverLayer,
    hoverGlow: hoverLayer?.querySelector('.hover-glow'),
    hoverHalo: hoverLayer?.querySelector('.hover-halo'),
    hoverOutline: hoverLayer?.querySelector('.hover-outline'),
    selHalo: selLayer?.querySelector('.select-halo'),
    selOutline: selLayer?.querySelector('.select-outline'),
  };
};

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
    const detailKey = fine ? 'fine' : 'coarse';
    if (countySubDCache?.code === countyCode && countySubDCache?.detail === detailKey) {
      return countySubDCache.d;
    }
    const d = townsOfUnit(countyCode).map(t => t.d).filter(Boolean).join('');
    countySubDCache = { code: countyCode, detail: detailKey, d };
    return d;
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
  if (!highlightRefs || highlightRefs.svg !== svg) bindHighlightRefs(svg);
  const refs = highlightRefs;
  const detail = svg.dataset.detail || 'coarse';

  const subD = getActiveSublinesD(detail);
  refs.subCasing?.setAttribute('d', subD);
  refs.subStroke?.setAttribute('d', subD);

  const { activeD, parentD } = getActiveOutlinesD(detail);
  refs.parentOutline?.setAttribute('d', parentD);
  refs.activeShadow?.setAttribute('d', activeD);
  refs.activeHalo?.setAttribute('d', activeD);
  refs.activeOutline?.setAttribute('d', activeD);

  const hoverD = currentHover ? getOutline(currentHover.type, currentHover.code, detail) : '';
  refs.hoverGlow?.setAttribute('d', hoverD);
  refs.hoverHalo?.setAttribute('d', hoverD);
  refs.hoverOutline?.setAttribute('d', hoverD);
  if (refs.hoverLayer) refs.hoverLayer.dataset.neighbor = currentHover?.isNeighbor ? '1' : '';

  const selD = currentSelect ? getOutline(currentSelect.type, currentSelect.code, detail) : '';
  refs.selHalo?.setAttribute('d', selD);
  refs.selOutline?.setAttribute('d', selD);
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
      svg.querySelector(`.city-points .cp-country .cp-item[data-code="${target.code}"]`)?.classList.add(cls);
    } else if (target.type === 'city') {
      svg.querySelector(`.city[data-city="${target.code}"]`)?.classList.add(cls);
      svg.querySelector(`.city-points .cp-province.active .cp-item[data-code="${target.code}"]`)?.classList.add(cls);
    } else if (target.type === 'unit') {
      for (const node of svg.querySelectorAll(`.unit[data-code="${target.code}"]`)) {
        node.classList.add(cls);
      }
      svg.querySelector(`.city-points .cp-group.active .cp-item[data-code="${target.code}"]`)?.classList.add(cls);
    } else if (target.type === 'town') {
      svg.querySelector(`.town[data-town="${target.code}"]`)?.classList.add(cls);
      svg.querySelector(`.city-points .cp-county.active .cp-item[data-code="${target.code}"]`)?.classList.add(cls);
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
    svg.querySelector(`.city-points .cp-group.active .cp-item[data-code="${target.code}"]`)?.classList.add('selected');
  } else if (target?.type === 'town') {
    svg.querySelector(`.town[data-town="${target.code}"]`)?.classList.add('selected');
    svg.querySelector(`.city-points .cp-county.active .cp-item[data-code="${target.code}"]`)?.classList.add('selected');
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
    countySubDCache = null;
    return [];
  }
  svg.dataset.activeUnit = unitCode;
  countySubDCache = null;
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

// 切换主图（不含插图）区县轮廓与边界线的精度（分帧批量更新，避免主线程尖峰）
let detailBatchRaf = 0;
export const setDetail = (svg, level) => {
  const src = level === 'fine' ? fine : coarse;
  if (!src) return false;
  if (svg.dataset.detail === level) return true;
  svg.dataset.detail = level;
  if (detailBatchRaf) cancelAnimationFrame(detailBatchRaf);

  const paths = [...svg.querySelectorAll('.prov .unit')];
  let i = 0;
  const applyLines = () => {
    svg.querySelector(':scope > .line-city')?.setAttribute('d', src.lines.city ?? '');
    svg.querySelector(':scope > .line-province')?.setAttribute('d', src.lines.province);
    svg.querySelector(':scope > .line-country')?.setAttribute('d', src.lines.country);
    svg.querySelector(':scope > .map-shadow')?.setAttribute('d', src.outline);
  };
  const step = () => {
    const end = Math.min(i + SET_DETAIL_BATCH, paths.length);
    for (; i < end; i++) {
      const p = paths[i];
      const d = src.units[p.dataset.code];
      if (d) p.setAttribute('d', d);
    }
    if (i < paths.length) {
      detailBatchRaf = requestAnimationFrame(step);
    } else {
      detailBatchRaf = 0;
      applyLines();
      if (svg.dataset.activeUnit) renderCountyTowns(svg, svg.dataset.activeUnit);
      syncHighlightLayer(svg);
    }
  };
  // 边界线先更新，区县 path 分帧
  applyLines();
  detailBatchRaf = requestAnimationFrame(step);
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
    el('text', {
      x: c.label[0],
      y: c.label[1],
      'data-code': c.code,
      ...(c.seatName ? { 'data-seat-diff': '1' } : {}),
    }, g).textContent = c.short;
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

// ---------- 城市/省会/治所驻地坐标图层 ----------
const STAR_D = 'M0,-4.1L1.02,-1.25L4,-1.25L1.6,0.5L2.5,3.4L0,1.65L-2.5,3.4L-1.6,0.5L-4,-1.25L-1.02,-1.25Z';

const appendPinNode = (parent, { code, seat, text, altText, tier = 'normal', extraAttrs = {} }) => {
  if (!Array.isArray(seat) || seat.length < 2) return null;
  const item = el('g', {
    class: 'cp-item',
    transform: `translate(${seat[0]}, ${seat[1]})`,
    'data-code': code,
    'data-tier': tier,
    ...(altText ? { 'data-short': text, 'data-alt': altText } : {}),
    ...extraAttrs,
  }, parent);
  const pin = el('g', { class: 'cp-pin' }, item);
  if (tier === 'country') {
    el('circle', { class: 'cp-halo', r: '6.2' }, pin);
    el('circle', { class: 'cp-ring', r: '4.8' }, pin);
    el('path', { class: 'cp-star', d: STAR_D }, pin);
  } else if (tier === 'province' || tier === 'city') {
    el('circle', { class: 'cp-halo', r: '5.2' }, pin);
    el('circle', { class: 'cp-ring', r: '3.8' }, pin);
    el('circle', { class: 'cp-dot', r: '1.75' }, pin);
  } else {
    el('circle', { class: 'cp-halo', r: '4.1' }, pin);
    el('circle', { class: 'cp-ring', r: '2.85' }, pin);
    el('circle', { class: 'cp-dot', r: '1.25' }, pin);
  }
  el('text', {
    class: 'cp-text',
    x: tier === 'normal' ? '6.5' : '8',
    y: '0',
  }, pin).textContent = text;
  return item;
};

// 全国视图：34 个省级行政中心（首都 + 省会/首府/直辖市/特区）
export const ensureCountryCityPoints = svg => {
  const layer = svg.querySelector(':scope > .city-points');
  if (!layer) return null;
  let g = layer.querySelector('g.cp-country');
  if (g) return g;
  g = el('g', { class: 'cp-group cp-country active' }, layer);
  // 普通省会先画，首都北京最后画在最顶层
  const ordered = [...provinces].sort((a, b) => (a.code === '110000' ? 1 : b.code === '110000' ? -1 : 0));
  for (const p of ordered) {
    if (!p.seat) continue;
    appendPinNode(g, {
      code: p.code,
      seat: p.seat,
      text: p.capital || p.short,
      tier: p.code === '110000' ? 'country' : 'province',
      extraAttrs: { 'data-province': p.code },
    });
  }
  return g;
};

// 省视图：省会/首府 + 省内各地级市/自治州/地区/盟/直辖县驻地
export const ensureProvinceCityPoints = (svg, provCode) => {
  const layer = svg.querySelector(':scope > .city-points');
  if (!layer) return null;
  let g = layer.querySelector(`g.cp-province[data-province="${provCode}"]`);
  if (g) return g;
  g = el('g', { class: 'cp-group cp-province', 'data-province': provCode }, layer);
  const list = [...citiesOf(provCode)].sort((a, b) => (a.capital ? 1 : b.capital ? -1 : 0));
  for (const c of list) {
    if (!c.seat) continue;
    appendPinNode(g, {
      code: c.code,
      seat: c.seat,
      text: c.seatName || c.short,
      altText: c.seatName ? `${c.short}·${c.seatName}` : null,
      tier: c.capital ? 'province' : 'normal',
    });
  }
  return g;
};

// 市视图：市政府驻地 + 市内各区县（县城/区治）驻地
export const ensureCityUnitPoints = (svg, cityCode) => {
  const layer = svg.querySelector(':scope > .city-points');
  if (!layer) return null;
  let g = layer.querySelector(`g.cp-city[data-city="${cityCode}"]`);
  if (g) return g;
  g = el('g', { class: 'cp-group cp-city', 'data-city': cityCode }, layer);
  const list = [...unitsOfCity(cityCode)].sort((a, b) => (a.capital ? 1 : b.capital ? -1 : 0));
  for (const u of list) {
    if (!u.seat) continue;
    appendPinNode(g, {
      code: u.code,
      seat: u.seat,
      text: u.short,
      tier: u.capital ? 'city' : 'normal',
    });
  }
  return g;
};

// 区县视图：区县政府驻地 + 各乡镇/街道办事处驻地
export const ensureUnitTownPoints = (svg, unitCode) => {
  const layer = svg.querySelector(':scope > .city-points');
  if (!layer) return null;
  let g = layer.querySelector(`g.cp-county[data-unit="${unitCode}"]`);
  if (g) g.remove();
  g = el('g', { class: 'cp-group cp-county active', 'data-unit': unitCode }, layer);
  const list = [...townsOfUnit(unitCode)].sort((a, b) => (a.capital ? 1 : b.capital ? -1 : 0));
  for (const t of list) {
    if (!t.seat) continue;
    appendPinNode(g, {
      code: t.code,
      seat: t.seat,
      text: t.short,
      tier: t.capital ? 'city' : 'normal',
    });
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
      role: 'button',
      tabindex: '0',
      'aria-label': p.name,
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
    // 城市/省会/治所驻地坐标图层
    el('g', { class: 'city-points' }, svg);
    ensureCountryCityPoints(svg);
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

  bindHighlightRefs(svg);
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
/** 当前动画 Promise 的 resolve，新动画启动时先结束旧 Promise，避免 await 挂起 */
let animationResolve = null;

export const stopAnimation = () => {
  cancelAnimationFrame(animation);
  if (animationResolve) {
    const done = animationResolve;
    animationResolve = null;
    done();
  }
};

export const currentView = svg => svg.getAttribute('viewBox').split(' ').map(Number);

/**
 * 平滑切换 viewBox；若已有动画进行中，立即结束旧 Promise 再启动新动画
 * @param {SVGSVGElement} svg
 * @param {number[]} to - 目标 viewBox [x, y, w, h]
 * @param {number} duration - 动画时长（毫秒）
 * @param {function|null} onFrame - 每帧回调
 * @returns {Promise<void>}
 */
export const animateView = (svg, to, duration = 650, onFrame = null) => new Promise(resolve => {
  stopAnimation();
  animationResolve = resolve;
  const from = currentView(svg);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) duration = 0;
  const start = performance.now();
  const step = now => {
    const t = duration ? Math.min(1, (now - start) / duration) : 1;
    const k = ease(t);
    const view = from.map((v, i) => v + (to[i] - v) * k);
    svg.setAttribute('viewBox', view.join(' '));
    onFrame?.(view);
    if (t < 1) {
      animation = requestAnimationFrame(step);
    } else {
      animationResolve = null;
      resolve();
    }
  };
  animation = requestAnimationFrame(step);
});

/** 清除 SVG getBoundingClientRect 缓存（侧栏折叠等不触发 window.resize 时调用） */
export const clearRectCache = () => { rectCache = null; };

export const unitsPerPixel = (svg, view = currentView(svg)) => {
  const { width, height } = rectOf(svg);
  return Math.max(view[2] / width, view[3] / height);
};
