// 计算几何工具：SVG 路径解析、多边形裁剪、面积/质心计算、外边缘轮廓提取
// @author ygw

/**
 * 将 SVG path 字符串解析为一组多边形环
 * @param {string} d - SVG path 的 d 属性
 * @returns {Array<Array<[number, number]>>} 多边形环数组
 */
export const parsePathRings = d => {
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

/**
 * 判断点是否在单个多边形环内（射线法）
 * @param {number} px - 点的 x 坐标
 * @param {number} py - 点的 y 坐标
 * @param {Array<[number, number]>} ring - 多边形环
 * @returns {boolean}
 */
export const ptInRing = (px, py, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
};

/**
 * 判断点是否在多环多边形内（奇偶规则：外环 + 孔洞）
 * @param {number} px - 点的 x 坐标
 * @param {number} py - 点的 y 坐标
 * @param {Array<Array<[number, number]>>} rings - 多边形环数组
 * @returns {boolean}
 */
export const ptInRings = (px, py, rings) => {
  let inside = false;
  for (const r of rings) if (ptInRing(px, py, r)) inside = !inside;
  return inside;
};

/**
 * 用半平面裁剪多边形环（Sutherland-Hodgman 单边裁剪）
 * @param {Array<[number, number]>} ring - 输入多边形环
 * @param {number} mx - 半平面分界线上一点的 x
 * @param {number} my - 半平面分界线上一点的 y
 * @param {number} nx - 半平面法向量 x 分量
 * @param {number} ny - 半平面法向量 y 分量
 * @returns {Array<[number, number]>} 裁剪后的多边形环
 */
export const clipRingHalfPlane = (ring, mx, my, nx, ny) => {
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

/**
 * 计算多边形环的面积和质心
 * @param {Array<[number, number]>} ring - 多边形环
 * @returns {{ area: number, cx: number, cy: number }}
 */
export const ringCentroidAndArea = ring => {
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

/**
 * 将多边形环数组转换为 SVG path d 属性字符串
 * @param {Array<Array<[number, number]>>} rings - 多边形环数组
 * @returns {string} SVG path 的 d 属性
 */
export const ringsToD = rings => {
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

/**
 * 计算多边形环数组的包围盒
 * @param {Array<Array<[number, number]>>} rings - 多边形环数组
 * @returns {[number, number, number, number]} [x0, y0, x1, y1]
 */
export const ringsBBox = rings => {
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

/**
 * 从一组拓扑对齐的区县 path 中消去内部公共边，只保留整块区域最外圈边界
 * @param {string[]} dList - SVG path d 属性字符串数组
 * @returns {string} 外边缘轮廓的 SVG path d 属性
 */
export const outerBoundaryD = dList => {
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
  for (const [, [, , k1, k2]] of edgeMap) {
    let l1 = adj.get(k1); if (!l1) { l1 = []; adj.set(k1, l1); }
    let l2 = adj.get(k2); if (!l2) { l2 = []; adj.set(k2, l2); }
  }
  for (const [key, [a, b, k1, k2]] of edgeMap) {
    adj.get(k1).push({ key, pt: b, k: k2 });
    adj.get(k2).push({ key, pt: a, k: k1 });
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
