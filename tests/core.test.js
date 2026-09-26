// 搜索评分与拓扑着色单元测试
// @author ygw
import { describe, it, expect } from 'vitest';
import { assignTones, shareVertices, extractPathVerts, TONE_COUNT } from '../src/topo-color.js';

describe('topo-color', () => {
  it('TONE_COUNT 为 6', () => {
    expect(TONE_COUNT).toBe(6);
  });

  it('extractPathVerts 能解析相对路径', () => {
    const verts = extractPathVerts('M10 10l10 0l0 10l-10 0z');
    expect(verts.size).toBeGreaterThan(0);
  });

  it('相邻区域分配不同色调', () => {
    // 两个共享多顶点的矩形（拓扑相邻）
    const a = { code: 'A', bbox: [0, 0, 10, 10], d: 'M0 0L10 0L10 10L0 10Z' };
    const b = { code: 'B', bbox: [10, 0, 20, 10], d: 'M10 0L20 0L20 10L10 10Z' };
    const tones = assignTones([a, b], it => extractPathVerts(it.d));
    expect(tones.get('A')).toBeDefined();
    expect(tones.get('B')).toBeDefined();
    expect(tones.get('A')).not.toBe(tones.get('B'));
  });

  it('shareVertices 要求至少 2 个共享点', () => {
    const s1 = new Set(['0,0', '1,0', '1,1']);
    const s2 = new Set(['1,0', '1,1', '2,2']);
    const s3 = new Set(['9,9']);
    expect(shareVertices(s1, s2)).toBe(true);
    expect(shareVertices(s1, s3)).toBe(false);
  });
});

/** 与 locator.js 中相同的评分逻辑（避免在 node 中加载整份地图 JSON） */
const score = (item, q) => {
  if (/^\d+$/.test(q)) {
    if (item.code === q) return 0;
    return item.code?.startsWith(q) ? 1 : -1;
  }
  if (/[\u4e00-\u9fff]/.test(q)) {
    if (item.short === q || item.name === q) return 0;
    return item.name.includes(q) || item.short.includes(q) ? 1 : -1;
  }
  const a = q.toLowerCase().replace(/[\s']/g, '');
  if (!a || !/^[a-z]+$/.test(a)) return -1;
  if (item.py === a) return 2;
  if (item.py.startsWith(a)) return 3;
  if (item.pi.startsWith(a)) return 4;
  return item.py.includes(a) ? 5 : -1;
};

describe('search score', () => {
  const item = { code: '110105', name: '朝阳区', short: '朝阳', py: 'chaoyang', pi: 'cy' };

  it('精确中文名得分最高', () => {
    expect(score(item, '朝阳区')).toBe(0);
    expect(score(item, '朝阳')).toBe(0);
  });

  it('区划代码前缀匹配', () => {
    expect(score(item, '110105')).toBe(0);
    expect(score(item, '1101')).toBe(1);
    expect(score(item, '999')).toBe(-1);
  });

  it('拼音全拼与首字母', () => {
    expect(score(item, 'chaoyang')).toBe(2);
    expect(score(item, 'chao')).toBe(3);
    expect(score(item, 'cy')).toBe(4);
  });
});
