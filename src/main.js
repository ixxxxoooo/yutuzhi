// 入口：中国行政区划地图（全国 ⇄ 省 ⇄ 市 ⇄ 区县/乡镇街道 四级交互、悬停着色与边缘高亮、区域信息实时展示）
import './card.css';
import {
  buildMap, setHover, setSelected, setActiveRegion, renderCountyTowns, animateView, loadFine, loadTowns, setDetail, setScale, fitView,
  provinceView, cityView, unitView, unitsPerPixel, currentView, svgRect, units, cities, provinces,
  unitByCode, cityByCode, provinceByCode, getTownByCode, unitsOf, citiesOf, unitsOfCity, townsOfUnit,
  unitPath, cityPath, townPath, ensureProvinceCityLabels, ensureCityUnitLabels, ensureUnitTownLabels,
  buildSanshaCard, SANSHA_CODES, isSansha, FULL_VIEW,
} from './map.js';
import { layoutLabels, leaderEnd } from './label-layout.js';
import { attachGestures } from './gesture.js';
import { createLocator } from './locator.js';
import { createBasemap, createLayerUI } from './basemap.js';
import { getSaveButtonLabel, generateMapPoster } from './export-map.js';
import { $, esc, narrowScreen } from './dom.js';

const svg = $('#map');
const basemapCanvas = $('#basemap');
const hoverCard = $('#hover-card');
const infoCard = $('#info-card');
const subTitle = $('#sub-title');
const subHint = $('#sub-hint');
const cityListEl = $('#city-list');
const sanshaCard = $('#sansha-card');
const sanshaSvg = sanshaCard.querySelector('svg');
const saveBtn = $('#save-btn');
const saveBtnLabel = $('#save-btn-label');
const exportModal = $('#export-modal');
const exportModalTitle = $('#export-modal-title');
const exportImg = $('#export-img');
const exportDownload = $('#export-download');
const root = document.documentElement;

const LABEL_PX = 13;       // 省视图地级市名、市视图区县名、区县视图乡镇名的基准屏幕字号
const PROV_LABEL_PX = 14;  // 全国视图放大后省名的屏幕字号
const PROV_LABEL_ZOOM = 2; // 全国视图放大到几倍后展开全部省名、换精细版
const MAX_ZOOM = { country: 16, province: 12, city: 12, county: 10 };

const TOTAL_AREA = provinces.reduce((s, p) => s + (p.area || 0), 0);
const TOTAL_TOWNS = provinces.reduce((s, p) => s + (p.towns || 0), 0);

// ---------- 行政区属性与统计计算 ----------
const DIRECT_SET = new Set(['110000', '120000', '310000', '500000']);
const SAR_SET = new Set(['810000', '820000']);

const provTypeOf = p => {
  if (DIRECT_SET.has(p.code)) return '直辖市';
  if (SAR_SET.has(p.code)) return '特别行政区';
  if (p.name.endsWith('自治区')) return '自治区';
  return '省';
};

const cityTypeOf = c => {
  if (c.single) return '省直辖县级';
  if (c.name.endsWith('自治州')) return '自治州';
  if (c.name.endsWith('地区')) return '地区';
  if (c.name.endsWith('盟')) return '盟';
  return '地级市';
};

const unitTypeOf = u => {
  if (u.code === '710000') return '省级行政区';
  if (u.name === '神农架林区') return '林区';
  if (u.name.endsWith('自治县')) return '自治县';
  if (u.name.endsWith('自治旗')) return '自治旗';
  if (u.name.endsWith('旗')) return '旗';
  if (u.name.endsWith('特区')) return '特区';
  if (u.name.endsWith('市')) return '县级市';
  if (u.name.endsWith('县')) return '县';
  if (u.name.endsWith('区')) return '市辖区';
  return '县级行政区';
};

const townTypeOf = t => {
  if (t.name.endsWith('街道') || t.name.endsWith('街道办事处')) return '街道';
  if (t.name.endsWith('民族乡')) return '民族乡';
  if (t.name.endsWith('苏木')) return '苏木';
  if (t.name.endsWith('镇')) return '镇';
  if (t.name.endsWith('乡')) return '乡';
  if (t.name.includes('开发区') || t.name.includes('园区') || t.name.includes('管理区')) return '园区/开发区';
  return '乡镇级';
};

const formatArea = km2 => {
  if (!km2) return '—';
  if (km2 >= 10000) return `${(km2 / 10000).toFixed(2)} 万 km²`;
  return `${km2.toLocaleString()} km²`;
};

const formatCoord = center => {
  if (!center || center.length < 2) return '—';
  return `${center[0].toFixed(2)}°E, ${center[1].toFixed(2)}°N`;
};

const breakdownUnits = list => {
  const counts = { 市辖区: 0, 县级市: 0, 县: 0, 自治县: 0, 旗: 0, 其他: 0 };
  for (const u of list) {
    const t = unitTypeOf(u);
    if (t === '市辖区') counts.市辖区++;
    else if (t === '县级市') counts.县级市++;
    else if (t === '县') counts.县++;
    else if (t === '自治县') counts.自治县++;
    else if (t === '旗' || t === '自治旗') counts.旗++;
    else counts.其他++;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个县级行政区`;
};

const breakdownTowns = list => {
  const counts = { 街道: 0, 镇: 0, 乡: 0, 民族乡: 0, 苏木: 0, 其他: 0 };
  for (const t of list) {
    const tp = townTypeOf(t);
    if (counts[tp] !== undefined) counts[tp]++;
    else counts.其他++;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个乡镇街道`;
};

const breakdownCities = list => {
  const counts = { 地级市: 0, 自治州: 0, 地区: 0, 盟: 0, 省直辖县级: 0 };
  for (const c of list) {
    const t = cityTypeOf(c);
    counts[t] = (counts[t] || 0) + 1;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个地级行政区`;
};

// 生成省 / 市 / 区县 / 乡镇 / 全国的标准化展示信息
const getRegionData = target => {
  if (!target || target.type === 'country') {
    const realCities = cities.filter(c => !c.single && !provinceByCode.get(c.province).direct);
    return {
      title: '全国行政区划总览',
      badge: '国家级',
      code: '100000',
      sub: '省 › 市 › 区县 › 乡镇/街道 四级行政区划查询',
      stats: [
        { label: '省级行政区', value: `${provinces.length} 个`, note: '23省·5自治区·4直辖市·2特区' },
        { label: '地级行政区', value: `${realCities.length} 个`, note: '地级市/自治州/地区/盟' },
        { label: '县级行政区', value: `${units.length} 个`, note: '市辖区/县级市/县/旗' },
        { label: '乡镇与街道', value: `${TOTAL_TOWNS.toLocaleString()} 个`, note: '镇/乡/街道办事处/苏木' },
      ],
      foot: '鼠标移至任意区域查看总量，支持省 › 市 › 区县 › 乡镇四级点击下钻',
    };
  }

  if (target.type === 'province') {
    const p = provinceByCode.get(target.code);
    const pCities = citiesOf(p.code);
    const pUnits = unitsOf(p.code);
    const pct = ((p.area / TOTAL_AREA) * 100).toFixed(2);
    const cityStat = p.single
      ? { label: '行政建制', value: '省级行政区', note: '台湾省' }
      : p.direct
        ? { label: '下辖区县', value: `${pUnits.length} 个`, note: breakdownUnits(pUnits) }
        : { label: '地级行政区', value: `${pCities.filter(c => !c.single).length} 个`, note: breakdownCities(pCities) };
    const unitStat = p.single
      ? { label: '区划代码', value: p.code, note: `简称：${p.short}` }
      : p.direct
        ? { label: '乡镇与街道', value: `${(p.towns || 0).toLocaleString()} 个`, note: '四级基层行政区划' }
        : { label: '县级行政区', value: `${pUnits.length} 个`, note: breakdownUnits(pUnits) };
    const previewNames = (p.direct ? pUnits : pCities).slice(0, 14).map(x => x.short).join(' · ')
      + ((p.direct ? pUnits : pCities).length > 14 ? ' 等' : '');
    return {
      title: p.name,
      badge: target.isNeighbor ? `邻省 · ${provTypeOf(p)}` : provTypeOf(p),
      code: p.code,
      sub: `简称：${p.short} · 代码：${p.code} · 乡镇街道：${p.towns || 0} 个`,
      stats: [
        cityStat,
        unitStat,
        { label: '辖区面积', value: formatArea(p.area), note: `约占全国 ${pct}%` },
        { label: '中心坐标', value: formatCoord(p.center), note: `拼音：${p.py}` },
      ],
      foot: previewNames ? `下辖：${previewNames}` : '',
      actionHint: p.single ? '省级行政区' : target.isNeighbor ? '点击切换到该省份' : '点击进入查看下辖市县',
    };
  }

  if (target.type === 'city') {
    const c = cityByCode.get(target.code);
    const p = provinceByCode.get(c.province);
    const cUnits = unitsOfCity(c.code);
    const pct = p.area ? ((c.area / p.area) * 100).toFixed(1) : '—';
    const previewNames = cUnits.slice(0, 14).map(u => u.short).join(' · ') + (cUnits.length > 14 ? ' 等' : '');
    return {
      title: c.name,
      badge: target.isNeighbor ? `邻市 · ${cityTypeOf(c)}` : cityTypeOf(c),
      code: c.code,
      sub: `所属：${p.name}（${p.short}） · 代码：${c.code}`,
      stats: [
        { label: '下辖区县', value: `${cUnits.length} 个`, note: breakdownUnits(cUnits) },
        { label: '下辖乡镇/街道', value: `${c.towns || 0} 个`, note: '街道 / 镇 / 乡' },
        { label: '辖区面积', value: formatArea(c.area), note: `占${p.short} ${pct}%` },
        { label: '中心坐标', value: formatCoord(c.center), note: `拼音：${c.py}` },
      ],
      foot: previewNames ? `下辖区县：${previewNames}` : '',
      actionHint: target.isNeighbor ? '点击切换到该城市' : '点击进入查看下辖区县',
    };
  }

  if (target.type === 'unit') {
    const u = unitByCode.get(target.code);
    const c = cityByCode.get(u.city);
    const p = provinceByCode.get(u.province);
    const tList = townsOfUnit(u.code);
    const parentArea = (c.single && !p.direct ? p.area : c.area) || 1;
    const parentShort = c.single && !p.direct ? p.short : c.short;
    const pct = ((u.area / parentArea) * 100).toFixed(1);
    const hierarchy = c && !c.single && !p.direct ? `${p.name} › ${c.name}` : p.name;
    const townNote = tList.length ? breakdownTowns(tList) : `${u.towns || 0} 个乡镇/街道`;
    const previewTowns = tList.slice(0, 12).map(t => t.short).join(' · ') + (tList.length > 12 ? ' 等' : '');
    return {
      title: u.name,
      badge: target.isNeighbor ? `邻区县 · ${unitTypeOf(u)}` : unitTypeOf(u),
      code: u.code,
      sub: `隶属：${hierarchy} · 代码：${u.code}`,
      stats: [
        { label: '下辖乡镇/街道', value: `${u.towns || tList.length} 个`, note: townNote },
        { label: '行政类别', value: unitTypeOf(u), note: `简称：${u.short}（${u.py}）` },
        { label: '辖区面积', value: formatArea(u.area), note: `占${parentShort} ${pct}%` },
        { label: '中心坐标', value: formatCoord(u.center), note: `区划代码 ${u.code}` },
      ],
      foot: previewTowns ? `下辖镇街：${previewTowns}` : `完整层级：${hierarchy} › ${u.name}`,
      actionHint: u.towns ? (activeCounty === u.code ? '当前所在区县' : '点击进入查看下辖乡镇与街道') : '县级行政区',
    };
  }

  if (target.type === 'town') {
    const t = getTownByCode(target.code);
    if (!t) return null;
    const u = unitByCode.get(t.unit);
    const c = cityByCode.get(t.city);
    const p = provinceByCode.get(t.province);
    const hierarchy = c && !c.single && !p.direct ? `${p.name} › ${c.name} › ${u.name}` : `${p.name} › ${u.name}`;
    const pct = u.area ? ((t.area / u.area) * 100).toFixed(1) : '—';
    return {
      title: t.name,
      badge: townTypeOf(t),
      code: t.code,
      sub: `隶属：${hierarchy}`,
      stats: [
        { label: '乡镇类别', value: townTypeOf(t), note: `简称：${t.short}（${t.py}）` },
        { label: '9位区划代码', value: t.code, note: `上级代码：${u.code}` },
        { label: '辖区面积', value: formatArea(t.area), note: `约占${u.short} ${pct}%` },
        { label: '中心坐标', value: formatCoord(t.center), note: u.name },
      ],
      foot: `四级完整路径：${hierarchy} › ${t.name}`,
      actionHint: '点击可固定/取消固定该乡镇街道信息',
    };
  }
  return null;
};

// ---------- 初始化地图 ----------
buildMap(svg);
buildSanshaCard(sanshaSvg);

// ---------- 视图状态 ----------
let activeProvince = null;      // 当前省代码；null 为全国视图
let activeCity = null;          // 当前地级市（或直辖市）代码
let activeCounty = null;        // 当前区县代码（四级乡镇视图）
let selectedTown = null;        // 区县视图下点击固定的乡镇代码
let hoveredTarget = null;       // 当前鼠标悬停目标 { type, code, isNeighbor }
let home = null;                // 当前视图的完整范围（缩放下限、复位目标）
let pendingFocus = null;        // 视图切换后要聚焦的目标代码

const currentViewMode = () => (activeCounty ? 'county' : activeCity ? 'city' : activeProvince ? 'province' : 'country');

// 当前默认（未悬停时）侧栏应展示的目标
const defaultInfoTarget = () => {
  if (selectedTown && getTownByCode(selectedTown)) return { type: 'town', code: selectedTown };
  if (activeCounty && unitByCode.has(activeCounty)) return { type: 'unit', code: activeCounty };
  if (activeCity) {
    const p = provinceByCode.get(activeProvince);
    if (p?.direct) return { type: 'province', code: activeProvince };
    return { type: 'city', code: activeCity };
  }
  if (activeProvince) return { type: 'province', code: activeProvince };
  return { type: 'country' };
};

// 渲染侧栏顶部详情卡片
const renderInfoCard = (target = hoveredTarget ?? defaultInfoTarget()) => {
  const info = getRegionData(target);
  if (!info) return;
  const isPinned = !hoveredTarget && selectedTown && target?.type === 'town' && target.code === selectedTown;
  infoCard.innerHTML = `
    <div class="info-head">
      <div class="info-title-row">
        <h2 class="info-title">${esc(info.title)}</h2>
        <span class="info-badge${isPinned ? ' pinned' : ''}">${isPinned ? '已固定 · ' : ''}${esc(info.badge)}</span>
      </div>
      <div class="info-sub">${esc(info.sub)}</div>
    </div>
    <div class="info-grid">
      ${info.stats.map(s => `
        <div class="info-stat">
          <span class="stat-label">${esc(s.label)}</span>
          <b class="stat-val">${esc(s.value)}</b>
          <small class="stat-note">${esc(s.note)}</small>
        </div>
      `).join('')}
    </div>
    ${info.foot ? `<div class="info-foot">${esc(info.foot)}</div>` : ''}
  `;
};

// 渲染鼠标跟随悬浮窗
const renderHoverCard = (target, clientX, clientY) => {
  if (!target || narrowScreen.matches) {
    hoverCard.hidden = true;
    return;
  }
  const info = getRegionData(target);
  if (!info) {
    hoverCard.hidden = true;
    return;
  }
  hoverCard.innerHTML = `
    <div class="hc-head">
      <b>${esc(info.title)}</b>
      <span class="hc-badge">${esc(info.badge)}</span>
      <code class="hc-code">${esc(info.code)}</code>
    </div>
    <div class="hc-grid">
      ${info.stats.map(s => `
        <div class="hc-item">
          <span>${esc(s.label)}</span>
          <b>${esc(s.value)}</b>
          <small>${esc(s.note)}</small>
        </div>
      `).join('')}
    </div>
    ${info.actionHint ? `<div class="hc-hint">${esc(info.actionHint)}</div>` : ''}
  `;
  hoverCard.hidden = false;
  positionHoverCard(clientX, clientY);
};

const positionHoverCard = (clientX, clientY) => {
  if (hoverCard.hidden) return;
  const pad = 16;
  const w = hoverCard.offsetWidth || 280;
  const h = hoverCard.offsetHeight || 160;
  let x = clientX + 18;
  let y = clientY + 18;
  if (x + w + pad > innerWidth) x = Math.max(pad, clientX - w - 16);
  if (y + h + pad > innerHeight) y = Math.max(pad, clientY - h - 16);
  hoverCard.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
};

// 渲染侧栏下辖行政区列表
const renderSubList = () => {
  if (activeCounty) {
    const list = townsOfUnit(activeCounty);
    subTitle.textContent = `下辖乡镇与街道（${list.length}）`;
    subHint.textContent = '悬停着色 · 点击固定';
    cityListEl.innerHTML = list.map(t => `
      <button type="button" data-type="town" data-code="${t.code}" class="${selectedTown === t.code ? 'selected' : ''}" title="${esc(t.name)}（${t.code}）">
        <span>${esc(t.name)}</span>
        <small>${t.area}km²</small>
      </button>
    `).join('');
  } else if (activeCity) {
    const list = unitsOfCity(activeCity);
    subTitle.textContent = `下辖区县（${list.length}）`;
    subHint.textContent = '悬停着色 · 点击进入乡镇';
    cityListEl.innerHTML = list.map(u => `
      <button type="button" data-type="unit" data-code="${u.code}" title="${esc(u.name)}（${u.towns || 0} 个乡镇街道）">
        <span>${esc(u.short)}</span>
        <small>${u.towns ? `${u.towns}镇街` : `${u.area}km²`}</small>
      </button>
    `).join('');
  } else if (activeProvince) {
    const list = citiesOf(activeProvince);
    subTitle.textContent = `下辖行政区（${list.length}）`;
    subHint.textContent = '悬停着色 · 点击进入';
    cityListEl.innerHTML = list.map(c => {
      if (c.single) {
        const u = unitByCode.get(c.code);
        return `<button type="button" data-type="unit" data-code="${c.code}" title="${esc(c.name)}"><span>${esc(c.short)}</span><small>${u?.towns ? `${u.towns}镇街` : '直辖'}</small></button>`;
      }
      const count = unitsOfCity(c.code).length;
      return `<button type="button" data-type="city" data-code="${c.code}" class="city-nav-btn" title="${esc(c.name)}（共 ${count} 个区县）"><span>${esc(c.short)}</span><small>${count}县区</small></button>`;
    }).join('');
  } else {
    subTitle.textContent = `省级行政区（${provinces.length}）`;
    subHint.textContent = '悬停着色 · 点击进入';
    cityListEl.innerHTML = provinces.map(p => {
      const count = unitsOf(p.code).length;
      return `<button type="button" data-type="province" data-code="${p.code}" class="city-nav-btn" title="${esc(p.name)}（${p.single ? '省级' : `${count} 个区县`}）"><span>${esc(p.short)}</span><small>${p.single ? '省级' : `${count}县区`}</small></button>`;
    }).join('');
  }
};

const syncListHover = target => {
  for (const b of cityListEl.querySelectorAll('button.hovered')) b.classList.remove('hovered');
  for (const b of sanshaCard.querySelectorAll('button.hovered')) b.classList.remove('hovered');
  if (!target) return;
  cityListEl.querySelector(`button[data-type="${target.type}"][data-code="${target.code}"]`)?.classList.add('hovered');
  if (target.type === 'unit' && isSansha(target.code)) {
    sanshaCard.querySelector(`button[data-code="${target.code}"]`)?.classList.add('hovered');
  }
};

const updateHover = (target, clientX = 0, clientY = 0, showFloating = false) => {
  const changed = setHover(svg, target);
  hoveredTarget = target;
  if (changed) {
    syncListHover(target);
    renderInfoCard(target ?? defaultInfoTarget());
  }
  if (showFloating && target) {
    if (changed || hoverCard.hidden) renderHoverCard(target, clientX, clientY);
    else positionHoverCard(clientX, clientY);
  } else {
    hoverCard.hidden = true;
  }
};

// 根据当前视图层级，解析鼠标所在的 path 对应的交互块（省 / 市 / 区县 / 乡镇）
const resolveMapTarget = targetEl => {
  if (!targetEl) return null;
  const townEl = targetEl.closest('.town');
  if (townEl && activeCounty) {
    return { type: 'town', code: townEl.dataset.town, isNeighbor: false };
  }

  const unitEl = targetEl.closest('.prov .unit');
  if (!unitEl) return null;
  const u = unitByCode.get(unitEl.dataset.code);
  if (!u) return null;

  // 1. 全国视图：按省整块着色并展示全省总量
  if (!activeProvince) {
    return { type: 'province', code: u.province, isNeighbor: false };
  }

  // 2. 省视图：本省内按地级市（或省直辖县）整块着色并展示该市总量；邻省按省整块提示
  if (!activeCity) {
    if (u.province === activeProvince) {
      const c = cityByCode.get(u.city);
      if (c?.single) return { type: 'unit', code: u.code, isNeighbor: false };
      return { type: 'city', code: u.city, isNeighbor: false };
    }
    return { type: 'province', code: u.province, isNeighbor: true };
  }

  // 3. 市视图：本市内按区县着色并展示该区县详情；同省邻市按市提示；邻省按省提示
  if (!activeCounty) {
    if (u.city === activeCity) {
      return { type: 'unit', code: u.code, isNeighbor: false };
    }
    if (u.province === activeProvince) {
      const c = cityByCode.get(u.city);
      if (c?.single) return { type: 'unit', code: u.code, isNeighbor: true };
      return { type: 'city', code: u.city, isNeighbor: true };
    }
    return { type: 'province', code: u.province, isNeighbor: true };
  }

  // 4. 区县（乡镇）视图：邻近区县按区县提示；邻市按市提示；邻省按省提示
  if (u.code === activeCounty) {
    return { type: 'unit', code: u.code, isNeighbor: false };
  }
  if (u.city === activeCity) {
    return { type: 'unit', code: u.code, isNeighbor: true };
  }
  if (u.province === activeProvince) {
    const c = cityByCode.get(u.city);
    if (c?.single) return { type: 'unit', code: u.code, isNeighbor: true };
    return { type: 'city', code: u.city, isNeighbor: true };
  }
  return { type: 'province', code: u.province, isNeighbor: true };
};

// ---------- 地图与侧栏鼠标悬停交互 ----------
svg.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const target = resolveMapTarget(e.target);
  updateHover(target, e.clientX, e.clientY, true);
});

svg.addEventListener('pointerleave', () => {
  updateHover(null);
});

cityListEl.addEventListener('pointerover', e => {
  if (e.pointerType === 'touch') return;
  const b = e.target.closest('button[data-type][data-code]');
  if (!b) return;
  updateHover({ type: b.dataset.type, code: b.dataset.code, isNeighbor: false }, 0, 0, false);
});

cityListEl.addEventListener('pointerleave', () => {
  updateHover(null);
});

cityListEl.addEventListener('click', e => {
  const b = e.target.closest('button[data-type][data-code]');
  if (!b) return;
  const { type, code } = b.dataset;
  if (type === 'province') {
    const p = provinceByCode.get(code);
    if (p.single) {
      updateHover({ type: 'province', code, isNeighbor: false });
      return;
    }
    goProvince(code);
  } else if (type === 'city') {
    goCity(code);
  } else if (type === 'unit') {
    goCounty(code);
  } else if (type === 'town') {
    applySelectedTown(selectedTown === code ? null : code);
  }
});

// ---------- 随视图同步的显示状态 ----------
const NS = 'http://www.w3.org/2000/svg';
const LEADER_DOT = 3; // 引线端点圆点半径（屏幕像素）

const setLabelSize = view => {
  const upp = unitsPerPixel(svg, view);
  svg.style.setProperty('--label-size', `${LABEL_PX * upp}px`);
  for (const c of svg.querySelectorAll('.city-labels g.active .leaders circle, .labels g.active .leaders circle, .town-labels g.active .leaders circle')) {
    c.setAttribute('r', LEADER_DOT * upp);
  }
};

const applyGroupLabels = (g, items, pathOf, view) => {
  if (!g) return;
  const upp = unitsPerPixel(svg, view), k = 1 / upp;
  const { left = 0, top = 0, right = 0, bottom = 0 } = viewInsets();
  const { width, height } = svgRect(svg);
  const { labels, missing, offscreen } = layoutLabels({
    units: items,
    pathOf,
    view: { vx: view[0], vy: view[1], k },
    bounds: { x0: left + 6, y0: top + 6, x1: width - right - 6, y1: height - bottom - 6 },
    base: LABEL_PX,
    scales: [1, 0.86, 0.74],
  });
  const leaders = g.querySelector('.leaders');
  leaders.replaceChildren();
  for (const l of labels) {
    const t = g.querySelector(`text[data-code="${l.u.code}"]`);
    if (!t) continue;
    t.setAttribute('x', view[0] + l.x * upp);
    t.setAttribute('y', view[1] + l.y * upp);
    t.style.setProperty('--ls', l.s / LABEL_PX);
    t.removeAttribute('hidden');
    if (l.leader) {
      const [ax, ay] = l.leader, [ex, ey] = leaderEnd(l);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', view[0] + ax * upp); line.setAttribute('y1', view[1] + ay * upp);
      line.setAttribute('x2', view[0] + ex * upp); line.setAttribute('y2', view[1] + ey * upp);
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', view[0] + ax * upp); dot.setAttribute('cy', view[1] + ay * upp);
      dot.setAttribute('r', LEADER_DOT * upp);
      leaders.append(line, dot);
    }
  }
  for (const u of offscreen) {
    const t = g.querySelector(`text[data-code="${u.code}"]`);
    if (!t) continue;
    t.setAttribute('x', u.label[0]); t.setAttribute('y', u.label[1]);
    t.style.removeProperty('--ls');
    t.removeAttribute('hidden');
  }
  for (const mCode of missing) {
    g.querySelector(`text[data-code="${mCode}"]`)?.setAttribute('hidden', '');
  }
  g.dataset.missing = missing.length;
};

// 省视图地级市名布局 / 市视图区县名布局 / 区县视图乡镇名布局
const layoutActiveLabels = view => {
  if (activeCounty) {
    const g = ensureUnitTownLabels(svg, activeCounty);
    applyGroupLabels(g, townsOfUnit(activeCounty).filter(t => t.d && t.label), townPath, view);
  } else if (activeCity) {
    const g = ensureCityUnitLabels(svg, activeCity);
    applyGroupLabels(g, unitsOfCity(activeCity).filter(u => u.d && u.label), unitPath, view);
  } else if (activeProvince) {
    const g = ensureProvinceCityLabels(svg, activeProvince);
    applyGroupLabels(g, citiesOf(activeProvince).filter(c => c.bbox && c.label), cityPath, view);
  }
};

// 全国视图显示清晰的矢量省名（未放大时隐藏极小重叠区域，放大后全部展开）
const updateCountryLabels = view => {
  const zoomed = !activeProvince && home && home[2] / view[2] >= PROV_LABEL_ZOOM;
  svg.classList.toggle('zoomed', zoomed);
  if (!activeProvince) {
    svg.style.setProperty('--prov-label-size', `${(zoomed ? PROV_LABEL_PX : 12.5) * unitsPerPixel(svg, view)}px`);
  }
};

const syncLabels = view => (activeProvince ? setLabelSize(view) : updateCountryLabels(view));

const syncDetail = () => setDetail(
  svg,
  activeProvince || svg.classList.contains('zoomed') || root.dataset.basemap || root.dataset.countyGrid ? 'fine' : 'coarse',
);

const basemap = createBasemap({
  canvas: basemapCanvas,
  svg,
  onStateChange: () => syncDetail(),
});
const layerUI = createLayerUI({
  button: $('#layer-btn'),
  menu: $('#layer-menu'),
  basemap,
});

const syncScale = view => {
  setScale(svg, unitsPerPixel(svg, view));
  basemap.render(view);
};

// ---------- 视图范围 ----------
const viewInsets = () => {
  const top = $('#topbar').getBoundingClientRect().bottom;
  const panel = $('#panel').getBoundingClientRect();
  if (narrowScreen.matches) return { top, bottom: innerHeight - panel.top };
  return { top, right: innerWidth - panel.left };
};

const countryFit = () => fitView(svg, FULL_VIEW, viewInsets());
const provinceFit = code => fitView(svg, provinceView(code), viewInsets());
const cityFit = code => fitView(svg, cityView(code), viewInsets());
const countyFit = code => fitView(svg, unitView(code), viewInsets());

const applySelectedTown = code => {
  selectedTown = code;
  setSelected(svg, code ? { type: 'town', code } : null);
  for (const b of cityListEl.querySelectorAll('button.selected')) b.classList.remove('selected');
  if (code) {
    const btn = cityListEl.querySelector(`button[data-type="town"][data-code="${code}"]`);
    if (btn) {
      btn.classList.add('selected');
      btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  renderInfoCard();
};

let flyingTarget = null;
const flyTo = async () => {
  const focus = pendingFocus;
  pendingFocus = null;
  if (focus && activeCounty && focus.length > 6) applySelectedTown(focus);
  const target = home;
  flyingTarget = target;
  if (activeProvince) layoutActiveLabels(target);
  syncLabels(target);
  if (activeProvince) syncDetail();
  await animateView(svg, target, 620, syncScale);
  flyingTarget = null;
  syncDetail();
};

const syncSaveBtnLabel = () => {
  if (!saveBtnLabel) return;
  const label = getSaveButtonLabel({ activeProvince, activeCity, activeCounty });
  saveBtnLabel.textContent = label;
  saveBtn.title = `${label}（高清 PNG）`;
};

const clearTownLayer = () => {
  renderCountyTowns(svg, null);
  svg.querySelector(':scope > .town-labels')?.replaceChildren();
};

const enterProvince = async code => {
  const p = provinceByCode.get(code);
  if (!p || p.single) return showCountry();
  if (p.direct) return enterCity(code);
  activeProvince = code;
  activeCity = null;
  activeCounty = null;
  selectedTown = null;
  clearTownLayer();
  setSelected(svg, null);
  updateHover(null);
  ensureProvinceCityLabels(svg, code);
  for (const g of svg.querySelectorAll('[data-province]')) g.classList.toggle('active', g.dataset.province === code);
  for (const g of svg.querySelectorAll('[data-city]')) g.classList.remove('active');
  for (const u of svg.querySelectorAll('.unit.active-county')) u.classList.remove('active-county');
  root.dataset.view = 'province';
  svg.classList.remove('zoomed');
  setActiveRegion(svg, { viewMode: 'province', provinceCode: code, cityCode: null, countyCode: null });
  $('#crumb-province .crumb-leaf').textContent = p.name;
  $('#crumb-province .crumb-leaf').title = '复位视图';
  $('#crumb-province').hidden = false;
  $('#crumb-city').hidden = true;
  $('#crumb-county').hidden = true;
  document.title = `${p.name} · YuTuZhi 舆图志`;
  sanshaCard.hidden = !unitsOf(code).some(u => isSansha(u.code));
  placeSanshaCard();
  syncSaveBtnLabel();
  renderSubList();
  renderInfoCard();
  home = provinceFit(code);
  await flyTo();
};

const enterCity = async cityCode => {
  const c = cityByCode.get(cityCode);
  if (!c) return showCountry();
  const p = provinceByCode.get(c.province);
  if (c.single && !p.direct) return enterCounty(c.code);
  activeProvince = p.code;
  activeCity = c.code;
  activeCounty = null;
  selectedTown = null;
  clearTownLayer();
  setSelected(svg, null);
  updateHover(null);
  ensureCityUnitLabels(svg, c.code);
  for (const g of svg.querySelectorAll('[data-province]')) g.classList.toggle('active', g.dataset.province === p.code);
  for (const g of svg.querySelectorAll('[data-city]')) g.classList.toggle('active', g.dataset.city === c.code);
  for (const u of svg.querySelectorAll('.unit.active-county')) u.classList.remove('active-county');
  root.dataset.view = 'city';
  svg.classList.remove('zoomed');
  setActiveRegion(svg, { viewMode: 'city', provinceCode: p.code, cityCode: c.code, countyCode: null });
  $('#crumb-province .crumb-leaf').textContent = p.name;
  $('#crumb-province .crumb-leaf').title = p.direct ? '复位视图' : `返回${p.name}`;
  $('#crumb-province').hidden = false;
  if (p.direct) {
    $('#crumb-city').hidden = true;
  } else {
    $('#crumb-city .crumb-leaf').textContent = c.name;
    $('#crumb-city .crumb-leaf').title = '复位视图';
    $('#crumb-city').hidden = false;
  }
  $('#crumb-county').hidden = true;
  document.title = `${p.direct ? p.name : `${p.name} · ${c.name}`} · YuTuZhi 舆图志`;
  sanshaCard.hidden = !unitsOfCity(c.code).some(u => isSansha(u.code));
  placeSanshaCard();
  syncSaveBtnLabel();
  renderSubList();
  renderInfoCard();
  home = cityFit(c.code);
  await flyTo();
};

const enterCounty = async unitCode => {
  const u = unitByCode.get(unitCode);
  if (!u || !u.d) return showCountry();
  await Promise.all([loadFine(), loadTowns()]);
  if (!u.towns) {
    const c = cityByCode.get(u.city);
    return enterCity(c.code);
  }
  const c = cityByCode.get(u.city);
  const p = provinceByCode.get(u.province);
  activeProvince = p.code;
  activeCity = c.code;
  activeCounty = u.code;
  selectedTown = null;
  setSelected(svg, null);
  updateHover(null);
  syncDetail();
  renderCountyTowns(svg, u.code);
  ensureUnitTownLabels(svg, u.code);

  for (const g of svg.querySelectorAll('[data-province]')) g.classList.toggle('active', g.dataset.province === p.code);
  for (const g of svg.querySelectorAll('[data-city]')) g.classList.toggle('active', g.dataset.city === c.code);
  for (const node of svg.querySelectorAll('.prov .unit')) {
    node.classList.toggle('active-county', node.dataset.code === u.code);
  }
  root.dataset.view = 'county';
  svg.classList.remove('zoomed');
  setActiveRegion(svg, { viewMode: 'county', provinceCode: p.code, cityCode: c.code, countyCode: u.code });

  $('#crumb-province .crumb-leaf').textContent = p.name;
  $('#crumb-province .crumb-leaf').title = `返回${p.name}`;
  $('#crumb-province').hidden = false;
  if (p.direct || c.single) {
    $('#crumb-city').hidden = true;
  } else {
    $('#crumb-city .crumb-leaf').textContent = c.name;
    $('#crumb-city .crumb-leaf').title = `返回${c.name}`;
    $('#crumb-city').hidden = false;
  }
  $('#crumb-county .crumb-leaf').textContent = u.name;
  $('#crumb-county .crumb-leaf').title = '复位视图';
  $('#crumb-county').hidden = false;
  document.title = `${p.name} · ${u.name} · YuTuZhi 舆图志`;

  sanshaCard.hidden = true;
  syncSaveBtnLabel();
  renderSubList();
  renderInfoCard();
  home = countyFit(u.code);
  await flyTo();
};

const showCountry = async () => {
  activeProvince = null;
  activeCity = null;
  activeCounty = null;
  selectedTown = null;
  clearTownLayer();
  setSelected(svg, null);
  updateHover(null);
  root.dataset.view = 'country';
  setActiveRegion(svg, { viewMode: 'country', provinceCode: null, cityCode: null, countyCode: null });
  $('#crumb-province').hidden = true;
  $('#crumb-city').hidden = true;
  $('#crumb-county').hidden = true;
  document.title = 'YuTuZhi 舆图志 · 中国行政区划地图';
  sanshaCard.hidden = true;
  for (const g of svg.querySelectorAll('.active')) g.classList.remove('active');
  for (const u of svg.querySelectorAll('.unit.active-county')) u.classList.remove('active-county');
  syncSaveBtnLabel();
  renderSubList();
  renderInfoCard();
  home = countryFit();
  await flyTo();
};

// hash 路由：#/140000 省视图，#/140100 市视图，#/140105 区县（乡镇）视图
const route = () => {
  const code = location.hash.match(/^#\/(\d{6,9})$/)?.[1];
  if (!code) return showCountry();
  if (code.length > 6) {
    const uCode = code.slice(0, 6);
    if (unitByCode.has(uCode)) {
      pendingFocus = code;
      return enterCounty(uCode);
    }
  }
  if (provinceByCode.has(code) && !provinceByCode.get(code).single) {
    const p = provinceByCode.get(code);
    if (p.direct) enterCity(code);
    else enterProvince(code);
  } else if (cityByCode.has(code) && !cityByCode.get(code).single) {
    enterCity(code);
  } else if (unitByCode.has(code)) {
    const u = unitByCode.get(code);
    const p = provinceByCode.get(u.province);
    if (p.single) showCountry();
    else enterCounty(u.code);
  } else {
    showCountry();
  }
};
addEventListener('hashchange', route);

const navigateHash = hash => {
  if (location.hash === hash) return flyTo();
  location.hash = hash;
};

const goProvince = (code, focus = null) => {
  pendingFocus = focus;
  navigateHash(`#/${code}`);
};

const goCity = (cityCode, focus = null) => {
  pendingFocus = focus;
  navigateHash(`#/${cityCode}`);
};

const goCounty = (unitCode, focus = null) => {
  const u = unitByCode.get(unitCode);
  if (!u) return;
  if (!u.towns || !u.d) {
    const c = cityByCode.get(u.city);
    return goCity(c.code);
  }
  pendingFocus = focus;
  navigateHash(`#/${unitCode}`);
};

const goCountry = (focus = null) => {
  pendingFocus = focus;
  if (!activeProvince) return flyTo();
  location.hash = '';
};

const goUp = () => {
  if (activeCounty) {
    const c = cityByCode.get(activeCity);
    const p = provinceByCode.get(activeProvince);
    if (c.single && !p.direct) goProvince(activeProvince);
    else goCity(activeCity);
  } else if (activeCity && activeCity !== activeProvince) {
    goProvince(activeProvince);
  } else if (activeProvince) {
    goCountry();
  }
};

// 复位到当前视图的完整范围
const resetView = () => {
  applySelectedTown(null);
  clearTimeout(relayoutTimer);
  if (activeProvince) layoutActiveLabels(home);
  syncLabels(home);
  animateView(svg, home, 400, syncScale).then(syncDetail);
};

// ---------- 顶栏：面包屑与搜索定位 ----------
$('#crumb-root').addEventListener('click', () => (activeProvince ? goCountry() : resetView()));
$('#crumb-province .crumb-leaf').addEventListener('click', () => {
  if (activeCounty || (activeCity && activeCity !== activeProvince)) goProvince(activeProvince);
  else resetView();
});
$('#crumb-city .crumb-leaf').addEventListener('click', () => {
  if (activeCounty) goCity(activeCity);
  else resetView();
});
$('#crumb-county .crumb-leaf').addEventListener('click', resetView);

const locator = createLocator({
  box: $('#search'),
  panel: $('#locator'),
  onTown: (townCode, unitCode) => goCounty(unitCode, townCode),
  onUnit: code => goCounty(code),
  onCity: code => goCity(code),
  onProvince: code => goProvince(code),
  getActiveProvince: () => activeProvince,
  getActiveCity: () => activeCity,
  getActiveCounty: () => activeCounty,
});

// ---------- 导出当前区域高清舆图海报 ----------
let lastExportUrl = null;
const closeExportModal = () => {
  exportModal.hidden = true;
};

exportModal.addEventListener('click', e => {
  if (e.target.closest('[data-close-export]')) closeExportModal();
});

saveBtn.addEventListener('click', async () => {
  if (saveBtn.disabled) return;
  locator.close();
  layerUI.close();
  hoverCard.hidden = true;

  const originalLabel = getSaveButtonLabel({ activeProvince, activeCity, activeCounty });
  saveBtn.disabled = true;
  saveBtnLabel.textContent = '正在生成…';

  try {
    await loadFine();
    setDetail(svg, 'fine');
    const regionInfo = getRegionData(defaultInfoTarget());
    const { url, filename } = await generateMapPoster({
      svg,
      activeProvince,
      activeCity,
      activeCounty,
      regionInfo,
    });
    if (lastExportUrl) URL.revokeObjectURL(lastExportUrl);
    lastExportUrl = url;
    exportModalTitle.textContent = `${originalLabel} · ${regionInfo.title}`;
    exportImg.src = url;
    exportDownload.href = url;
    exportDownload.download = filename;
    exportModal.hidden = false;
  } finally {
    saveBtn.disabled = false;
    syncSaveBtnLabel();
    syncDetail();
  }
});

// ---------- 三沙卡片 ----------
const placeSanshaCard = () => {
  if (sanshaCard.hidden) return;
  const { left = 0, bottom = 0 } = viewInsets();
  sanshaCard.style.left = `${left + 16}px`;
  sanshaCard.style.bottom = `${bottom + 16}px`;
};
sanshaCard.addEventListener('pointerover', e => {
  const btn = e.target.closest('button[data-code]');
  if (btn) updateHover({ type: 'unit', code: btn.dataset.code, isNeighbor: false });
});
sanshaCard.addEventListener('pointerleave', () => updateHover(null));
sanshaCard.addEventListener('click', e => {
  e.stopPropagation();
  const btn = e.target.closest('button[data-code]');
  const code = btn?.dataset.code ?? SANSHA_CODES[0];
  if (activeCity !== '460300') goCity('460300');
  else updateHover({ type: 'unit', code, isNeighbor: false });
});

// ---------- 地图点击导航 ----------
svg.addEventListener('click', e => {
  e.stopPropagation();
  if (locator.isOpen()) return locator.close();
  if (layerUI.isOpen()) return layerUI.close();

  const townEl = e.target.closest('.town');
  if (townEl && activeCounty) {
    const tCode = townEl.dataset.town;
    applySelectedTown(selectedTown === tCode ? null : tCode);
    return;
  }

  const unit = e.target.closest('.prov .unit');
  const provCode = unit?.closest('[data-province]')?.dataset.province;
  const cityCode = unit?.closest('[data-city]')?.dataset.city;
  const singleProv = provCode && provinceByCode.get(provCode).single;

  // 1. 全国视图：点击省份进入该省
  if (!activeProvince) {
    if (provCode && !singleProv) goProvince(provCode);
    return;
  }

  // 2. 省视图：点击地级市进入该市；点省直辖县进入该县；点邻省切换省份；点空白处返回全国
  if (!activeCity) {
    if (provCode === activeProvince) {
      const c = cityByCode.get(cityCode);
      if (c.single) return goCounty(unit.dataset.code);
      return goCity(cityCode);
    }
    if (!provCode) return goCountry();
    if (!singleProv) return goProvince(provCode);
    return;
  }

  // 3. 市视图：点击本市区县进入该区县（查看乡镇/街道）；点同省邻市切换地级市；点邻省切换省份；点空白处返回上一级
  if (!activeCounty) {
    if (cityCode === activeCity) return goCounty(unit.dataset.code);
    if (!provCode) return goUp();
    if (provCode === activeProvince) {
      const c = cityByCode.get(cityCode);
      if (c.single) return goCounty(unit.dataset.code);
      return goCity(cityCode);
    }
    if (!singleProv) return goProvince(provCode);
    return;
  }

  // 4. 区县（乡镇）视图：点同市邻区县切换区县；点同省邻市切换地级市；点邻省切换省份；点空白处返回市视图
  if (!provCode) {
    if (selectedTown) return applySelectedTown(null);
    return goUp();
  }
  if (cityCode === activeCity && unit.dataset.code !== activeCounty) {
    return goCounty(unit.dataset.code);
  }
  if (provCode === activeProvince) {
    const c = cityByCode.get(cityCode);
    if (c.single) return goCounty(unit.dataset.code);
    return goCity(cityCode);
  }
  if (!singleProv) return goProvince(provCode);
});

let relayoutTimer = 0;
attachGestures(svg, {
  getHome: () => home,
  maxZoom: () => MAX_ZOOM[currentViewMode()],
  canZoomOutLevel: () => Boolean(activeProvince),
  onZoomOutLevel: () => goUp(),
  onStart: () => { locator.close(); layerUI.close(); hoverCard.hidden = true; },
  onChange: view => {
    syncLabels(view);
    syncScale(view);
    syncDetail();
    clearTimeout(relayoutTimer);
    if (activeProvince) relayoutTimer = setTimeout(() => layoutActiveLabels(currentView(svg)), 180);
  },
});

// ---------- 全局事件 ----------
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!exportModal.hidden) closeExportModal();
  else if (locator.isOpen()) locator.close();
  else if (layerUI.isOpen()) layerUI.close();
  else if (selectedTown) applySelectedTown(null);
  else if (activeProvince) goUp();
});

const refit = (animate = false) => {
  const old = currentView(svg);
  const zoom = home ? home[2] / old[2] : 1;
  const cx = old[0] + old[2] / 2, cy = old[1] + old[3] / 2;
  home = activeCounty ? countyFit(activeCounty) : activeCity ? cityFit(activeCity) : activeProvince ? provinceFit(activeProvince) : countryFit();
  const w = home[2] / zoom, h = home[3] / zoom;
  const view = [
    Math.min(Math.max(cx - w / 2, home[0]), home[0] + home[2] - w),
    Math.min(Math.max(cy - h / 2, home[1]), home[1] + home[3] - h),
    w, h,
  ];
  if (activeProvince) layoutActiveLabels(view);
  syncLabels(view);
  placeSanshaCard();
  if (animate) return animateView(svg, view, 300, syncScale);
  svg.setAttribute('viewBox', view.join(' '));
  syncScale(view);
};

let lastWidth = innerWidth;
addEventListener('resize', () => {
  const widthChanged = innerWidth !== lastWidth;
  lastWidth = innerWidth;
  if (!widthChanged && document.activeElement?.matches('input, textarea')) return;
  refit();
});

// ---------- 手机端底部面板 ----------
const panel = $('#panel');
const panelToggle = $('#panel-toggle');
const PANEL_KEY = 'china-map-explorer:panel-collapsed';
const setCollapsed = (collapsed, animate = true) => {
  panel.classList.toggle('collapsed', collapsed);
  panelToggle.setAttribute('aria-expanded', !collapsed);
  panelToggle.setAttribute('aria-label', collapsed ? '展开面板' : '收起面板');
  try { localStorage.setItem(PANEL_KEY, collapsed ? '1' : ''); } catch { /* 忽略 */ }
  if (narrowScreen.matches) refit(animate);
};
let dragStart = null;
panelToggle.addEventListener('pointerdown', e => {
  dragStart = e.clientY;
  try { panelToggle.setPointerCapture(e.pointerId); } catch { /* 指针已失效时忽略 */ }
});
panelToggle.addEventListener('pointerup', e => {
  if (dragStart === null) return;
  const dy = e.clientY - dragStart;
  dragStart = null;
  if (dy > 24) setCollapsed(true);
  else if (dy < -24) setCollapsed(false);
  else setCollapsed(!panel.classList.contains('collapsed'));
});
panelToggle.addEventListener('pointercancel', () => { dragStart = null; });
panelToggle.addEventListener('click', e => { if (e.detail === 0) setCollapsed(!panel.classList.contains('collapsed')); });
try { if (localStorage.getItem(PANEL_KEY)) panel.classList.add('collapsed'); } catch { /* 忽略 */ }
panelToggle.setAttribute('aria-expanded', !panel.classList.contains('collapsed'));

// ---------- 启动 ----------
root.dataset.view = 'country';
svg.setAttribute('viewBox', countryFit().join(' '));
syncScale(currentView(svg));
route();

// 首屏之后在后台加载精细版边界与四级乡镇数据
const preloadAssets = () => Promise.all([loadFine(), loadTowns()]).then(() => {
  syncDetail();
  if (activeCounty) {
    renderCountyTowns(svg, activeCounty);
    renderSubList();
  }
  if (activeProvince) layoutActiveLabels(flyingTarget ?? currentView(svg));
  renderInfoCard();
}).catch(() => { /* 忽略 */ });
if ('requestIdleCallback' in window) requestIdleCallback(preloadAssets, { timeout: 1200 });
else setTimeout(preloadAssets, 300);
