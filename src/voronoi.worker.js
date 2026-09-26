// 乡镇 Voronoi 剖分 Web Worker（避免大区县主线程卡顿）
// @author ygw
import { computeTownCells } from './voronoi-core.js';

self.onmessage = e => {
  const { id, pathD, entries, meta } = e.data || {};
  try {
    const list = computeTownCells({ pathD, entries, meta });
    self.postMessage({ id, ok: true, list });
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
