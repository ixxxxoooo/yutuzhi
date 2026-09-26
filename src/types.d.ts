// 核心数据结构类型定义（渐进 TypeScript 引入）
// @author ygw

/**
 * @typedef {object} Province
 * @property {string} code - 6 位省级区划代码
 * @property {string} name - 全称
 * @property {string} short - 简称
 * @property {string} py - 全拼
 * @property {string} pi - 拼音首字母
 * @property {boolean} [single] - 是否无下辖地级（港澳台等）
 * @property {boolean} [direct] - 是否直辖市（直接下辖区县）
 * @property {number} [area] - 面积 km²
 * @property {number} [towns] - 乡镇数
 * @property {[number, number]} [center] - 中心经纬度
 * @property {[number, number]} [label] - 标签地图坐标
 * @property {[number, number, number, number]} [bbox] - 包围盒
 */

/**
 * @typedef {object} City
 * @property {string} code
 * @property {string} name
 * @property {string} short
 * @property {string} province
 * @property {string} py
 * @property {string} pi
 * @property {boolean} [single]
 * @property {number} [area]
 * @property {number} [towns]
 * @property {[number, number]} [center]
 * @property {[number, number]} [label]
 * @property {[number, number, number, number]} [bbox]
 */

/**
 * @typedef {object} Unit
 * @property {string} code
 * @property {string} name
 * @property {string} short
 * @property {string} province
 * @property {string} city
 * @property {string} py
 * @property {string} pi
 * @property {string} [d] - SVG path（可能独立加载）
 * @property {number} [area]
 * @property {number} [towns]
 * @property {[number, number]} [center]
 * @property {[number, number]} [label]
 * @property {[number, number, number, number]} [bbox]
 */

/**
 * @typedef {object} Town
 * @property {string} code - 9 位代码
 * @property {string} name
 * @property {string} short
 * @property {string} py
 * @property {string} pi
 * @property {string} unit
 * @property {string} city
 * @property {string} province
 * @property {string} d
 * @property {[number, number]|null} label
 * @property {[number, number, number, number]} bbox
 * @property {number} area
 * @property {[number, number]} center
 */

/**
 * @typedef {object} RegionTarget
 * @property {'country'|'province'|'city'|'unit'|'town'} type
 * @property {string} [code]
 * @property {boolean} [isNeighbor]
 */

/**
 * @typedef {object} RegionInfo
 * @property {string} title
 * @property {string} badge
 * @property {string} code
 * @property {string} sub
 * @property {Array<{label: string, value: string, note: string}>} stats
 * @property {string} [foot]
 * @property {string} [actionHint]
 */

export {};
