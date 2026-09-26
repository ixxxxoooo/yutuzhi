// 拓扑邻接六色着色算法：基于共享边界顶点构建邻接图，贪心分配互不冲突的舆图色调
// @author ygw

/** 舆图色板色调数量 */
export const TONE_COUNT = 6;

/**
 * 从 SVG path d 属性中提取离散化顶点集合（用于邻接检测）
 * @param {string} d - SVG path 的 d 属性
 * @returns {Set<string>} 离散化顶点坐标字符串集合
 */
export const extractPathVerts = d => {
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

/**
 * 判断两个顶点集合是否共享 ≥2 个顶点（即两区域相邻）
 * @param {Set<string>} setA - 顶点集合 A
 * @param {Set<string>} setB - 顶点集合 B
 * @returns {boolean}
 */
export const shareVertices = (setA, setB) => {
  if (!setA || !setB || !setA.size || !setB.size) return false;
  const [small, large] = setA.size <= setB.size ? [setA, setB] : [setB, setA];
  let shared = 0;
  for (const v of small) {
    if (large.has(v) && ++shared >= 2) return true;
  }
  return false;
};

/**
 * 为一组区域分配互不冲突的六色色调（贪心着色算法）
 * @param {Array<{code: string, bbox: number[]}>} items - 区域对象列表（需含 code 和 bbox 字段）
 * @param {function} getVerts - 获取区域顶点集合的函数 item => Set<string>
 * @returns {Map<string, number>} code → tone 映射
 */
export const assignTones = (items, getVerts) => {
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
  // 按邻接度降序 + 空间位置排序，使贪心着色零冲突且色调分布均匀
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
