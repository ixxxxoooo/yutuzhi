// 行政区域类型判断、统计信息格式化与区域详情数据组装
// @author ygw

import {
  provinces, units,
  provinceByCode, cityByCode, unitByCode,
  citiesOf, unitsOf, unitsOfCity, townsOfUnit,
  getTownByCode,
} from './map.js';

// ---------- 常量 ----------
const DIRECT_SET = new Set(['110000', '120000', '310000', '500000']);
const SAR_SET = new Set(['810000', '820000']);

/** 省级行政区总面积 */
export const TOTAL_AREA = provinces.reduce((s, p) => s + (p.area || 0), 0);

/** 全国乡镇/街道总数 */
export const TOTAL_TOWNS = provinces.reduce((s, p) => s + (p.towns || 0), 0);

// ---------- 行政区类型判定 ----------

/**
 * 判断省级行政区的类型
 * @param {object} p - 省级行政区对象
 * @returns {string} 直辖市 | 特别行政区 | 自治区 | 省
 */
export const provTypeOf = p => {
  if (DIRECT_SET.has(p.code)) return '直辖市';
  if (SAR_SET.has(p.code)) return '特别行政区';
  if (p.name.endsWith('自治区')) return '自治区';
  return '省';
};

/**
 * 判断地级行政区的类型
 * @param {object} c - 地级行政区对象
 * @returns {string} 省直辖县级 | 自治州 | 地区 | 盟 | 地级市
 */
export const cityTypeOf = c => {
  if (c.single) return '省直辖县级';
  if (c.name.endsWith('自治州')) return '自治州';
  if (c.name.endsWith('地区')) return '地区';
  if (c.name.endsWith('盟')) return '盟';
  return '地级市';
};

/**
 * 判断县级行政区的类型
 * @param {object} u - 县级行政区对象
 * @returns {string} 类型名称（市辖区、县级市、县、自治县、旗 等）
 */
export const unitTypeOf = u => {
  if (u.province === '710000') return u.name.endsWith('市') ? '市' : '县';
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

/**
 * 判断乡镇级行政区的类型
 * @param {object} t - 乡镇级行政区对象
 * @returns {string} 街道 | 镇 | 乡 | 民族乡 | 苏木 等
 */
export const townTypeOf = t => {
  if (t.name.endsWith('街道') || t.name.endsWith('街道办事处')) return '街道';
  if (t.name.endsWith('民族乡')) return '民族乡';
  if (t.name.endsWith('苏木')) return '苏木';
  if (t.name.endsWith('镇')) return '镇';
  if (t.name.endsWith('乡')) return '乡';
  if (t.name.endsWith('区')) return '市辖区';
  if (t.name.endsWith('市')) return '县辖市';
  if (t.name.includes('开发区') || t.name.includes('园区') || t.name.includes('管理区')) return '园区/开发区';
  return '乡镇级';
};

// ---------- 格式化工具 ----------

/**
 * 格式化面积显示（带单位自动切换）
 * @param {number} km2 - 面积（平方公里）
 * @returns {string} 格式化后的面积字符串
 */
export const formatArea = km2 => {
  if (!km2) return '—';
  if (km2 >= 10000) return `${(km2 / 10000).toFixed(2)} 万 km²`;
  return `${km2.toLocaleString()} km²`;
};

/**
 * 格式化中心坐标
 * @param {[number, number]} center - [经度, 纬度]
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoord = center => {
  if (!center || center.length < 2) return '—';
  return `${center[0].toFixed(2)}°E, ${center[1].toFixed(2)}°N`;
};

// ---------- 统计分解 ----------

/**
 * 将县级行政区列表按类型统计
 * @param {Array} list - 县级行政区列表
 * @returns {string} 统计文本
 */
export const breakdownUnits = list => {
  const counts = { 市辖区: 0, 市: 0, 县级市: 0, 县: 0, 自治县: 0, 旗: 0, 其他: 0 };
  for (const u of list) {
    const t = unitTypeOf(u);
    if (counts[t] !== undefined) counts[t]++;
    else if (t === '自治旗') counts.旗++;
    else counts.其他++;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个县级行政区`;
};

/**
 * 将乡镇/街道列表按类型统计
 * @param {Array} list - 乡镇/街道列表
 * @returns {string} 统计文本
 */
export const breakdownTowns = list => {
  const counts = { 街道: 0, 市辖区: 0, 县辖市: 0, 镇: 0, 乡: 0, 民族乡: 0, 苏木: 0, 其他: 0 };
  for (const t of list) {
    const tp = townTypeOf(t);
    if (counts[tp] !== undefined) counts[tp]++;
    else counts.其他++;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个乡镇街道`;
};

/**
 * 将地级行政区列表按类型统计
 * @param {Array} list - 地级行政区列表
 * @returns {string} 统计文本
 */
export const breakdownCities = list => {
  const counts = { 地级市: 0, 自治州: 0, 地区: 0, 盟: 0, 省直辖县级: 0 };
  for (const c of list) {
    const t = cityTypeOf(c);
    counts[t] = (counts[t] || 0) + 1;
  }
  const parts = Object.entries(counts).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${k}`);
  return parts.join(' · ') || `${list.length} 个地级行政区`;
};

// ---------- 区域详情数据组装 ----------

/**
 * 生成省 / 市 / 区县 / 乡镇 / 全国的标准化展示信息
 * @param {object|null} target - { type, code, isNeighbor } 目标区域
 * @param {{ activeCounty?: string }} context - 当前视图上下文（包含 activeCounty 状态）
 * @returns {object|null} 区域展示信息对象
 */
export const getRegionData = (target, { activeCounty = null } = {}) => {
  if (!target || target.type === 'country') {
    const cities = provinces.flatMap(p => citiesOf(p.code));
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
    const isTaiwan = p.code === '710000';
    const isSar = SAR_SET.has(p.code);
    const cityStat = isTaiwan
      ? { label: '下辖市县', value: `${pUnits.length} 个`, note: breakdownUnits(pUnits) }
      : p.direct
        ? { label: '下辖区县', value: `${pUnits.length} 个`, note: breakdownUnits(pUnits) }
        : { label: '地级行政区', value: `${pCities.filter(c => !c.single).length} 个`, note: breakdownCities(pCities) };
    const unitStat = isTaiwan
      ? { label: '乡镇市区', value: `${(p.towns || 0).toLocaleString()} 个`, note: '170区 · 14市 · 38镇 · 136乡' }
      : isSar
        ? { label: '行政建制', value: '特别行政区', note: p.code === '810000' ? '香港十八区' : '澳门堂区/分区' }
        : p.direct
          ? { label: '乡镇与街道', value: `${(p.towns || 0).toLocaleString()} 个`, note: '四级基层行政区划' }
          : { label: '县级行政区', value: `${pUnits.length} 个`, note: breakdownUnits(pUnits) };
    const previewList = p.direct || isTaiwan ? pUnits : pCities;
    const previewNames = previewList.slice(0, 14).map(x => x.short).join(' · ')
      + (previewList.length > 14 ? ' 等' : '');
    const subTownText = p.towns ? ` · 乡镇街道：${p.towns} 个` : '';
    return {
      title: p.name,
      badge: target.isNeighbor ? `邻省 · ${provTypeOf(p)}` : provTypeOf(p),
      code: p.code,
      sub: `简称：${p.short} · 代码：${p.code}${subTownText}`,
      stats: [
        cityStat,
        unitStat,
        { label: '辖区面积', value: formatArea(p.area), note: `约占全国 ${pct}%` },
        { label: '中心坐标', value: formatCoord(p.center), note: `拼音：${p.py}` },
      ],
      foot: previewNames ? `下辖：${previewNames}` : '',
      actionHint: target.isNeighbor ? '点击切换到该省份' : '点击进入查看下辖市县',
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
