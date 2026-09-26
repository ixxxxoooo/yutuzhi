// 乡镇 Voronoi 剖分纯计算（主线程与 Web Worker 共用）
// @author ygw
import {
  parsePathRings, ptInRings, clipRingHalfPlane, ringCentroidAndArea, ringsToD, ringsBBox,
} from './geometry.js';

const DEG = Math.PI / 180;
const PHI0 = 25 * DEG;
const PHI1 = 47 * DEG;
const LAM0 = 105 * DEG;
const N_CONE = (Math.sin(PHI0) + Math.sin(PHI1)) / 2;
const C_CONE = 1 + Math.sin(PHI0) * Math.sin(PHI1);
const PAD = 16;
const BX0 = -0.41107467;
const BY0 = 1.05083385;
const PROJ_K = 1279.457409;

/**
 * 经纬度转 SVG 地图坐标
 * @param {number} lon
 * @param {number} lat
 * @returns {[number, number]}
 */
const lonLatToSvg = (lon, lat) => {
  const r = Math.sqrt(Math.max(0, C_CONE - 2 * N_CONE * Math.sin(lat * DEG))) / N_CONE;
  const theta = N_CONE * (lon * DEG - LAM0);
  const fx = r * Math.sin(theta);
  const fy = r * Math.cos(theta);
  return [PAD + (fx - BX0) * PROJ_K, PAD + (fy - BY0) * PROJ_K];
};

/**
 * SVG 地图坐标转经纬度
 * @param {number} svgX
 * @param {number} svgY
 * @returns {[number, number]}
 */
const svgToLonLat = (svgX, svgY) => {
  const fx = BX0 + (svgX - PAD) / PROJ_K;
  const fy = BY0 + (svgY - PAD) / PROJ_K;
  const theta = Math.atan2(fx, fy);
  const r2 = fx * fx + fy * fy;
  const sinPhi = Math.max(-1, Math.min(1, (C_CONE - r2 * N_CONE * N_CONE) / (2 * N_CONE)));
  return [(LAM0 + theta / N_CONE) / DEG, Math.asin(sinPhi) / DEG];
};

/**
 * 根据区县轮廓与乡镇驻地坐标计算 Voronoi 分区
 * @param {object} input
 * @param {string} input.pathD - 区县 SVG path
 * @param {Array} input.entries - 乡镇条目 [code, name, short, py, pi, lon?, lat?]
 * @param {object} input.meta - { code, city, province, area, bbox, center }
 * @returns {Array<object>} 乡镇对象列表（含 d / label / bbox）
 */
export const computeTownCells = ({ pathD, entries, meta }) => {
  const N = entries.length;
  if (!N) return [];

  const rings = parsePathRings(pathD);
  if (!rings.length) {
    return entries.map(([code, name, short, py, pi, tLon, tLat]) => ({
      code, name, short, py, pi,
      unit: meta.code, city: meta.city, province: meta.province,
      d: '', label: null, bbox: meta.bbox,
      area: Math.max(1, Math.round((meta.area || N) / N)),
      center: tLon && tLat
        ? [Math.round(tLon * 100) / 100, Math.round(tLat * 100) / 100]
        : meta.center,
    }));
  }

  let mainRing = rings[0];
  let mainStats = ringCentroidAndArea(mainRing);
  for (let i = 1; i < rings.length; i++) {
    const st = ringCentroidAndArea(rings[i]);
    if (st.area > mainStats.area) {
      mainRing = rings[i];
      mainStats = st;
    }
  }
  const { cx: cx0, cy: cy0, area: mainArea } = mainStats;
  const rEst = Math.sqrt(mainArea / Math.PI);

  const seeds = entries.map(([, , , , , tLon, tLat], i) => {
    if (typeof tLon === 'number' && typeof tLat === 'number') {
      let [sx, sy] = lonLatToSvg(tLon, tLat);
      if (!ptInRings(sx, sy, rings)) {
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
    let cellRings = rings.map(r => r);
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const [ox, oy] = curSeeds[j];
      const mx = (sx + ox) / 2, my = (sy + oy) / 2;
      const nx = ox - sx, ny = oy - sy;
      cellRings = cellRings.map(r => clipRingHalfPlane(r, mx, my, nx, ny)).filter(r => r.length >= 3);
    }
    return cellRings;
  });

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

  return entries.map(([code, name, short, py, pi, tLon, tLat], i) => {
    const cellRings = cells[i];
    const { svgArea, label } = cellStats[i];
    const areaKm2 = Math.max(1, Math.round(((meta.area || N * 15) * svgArea) / totalSvgArea));
    const [lon, lat] = (typeof tLon === 'number' && typeof tLat === 'number')
      ? [tLon, tLat]
      : svgToLonLat(label[0], label[1]);
    return {
      code,
      name,
      short,
      py,
      pi,
      unit: meta.code,
      city: meta.city,
      province: meta.province,
      d: ringsToD(cellRings),
      label,
      bbox: cellRings.length ? ringsBBox(cellRings) : meta.bbox,
      area: areaKm2,
      center: [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100],
    };
  });
};
