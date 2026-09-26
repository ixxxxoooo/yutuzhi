#!/usr/bin/env node
// 将 src/towns-data.json 按省级前缀拆分为 src/towns/XX.json，并生成搜索索引
// @author ygw
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src/towns-data.json');
const OUT_DIR = join(ROOT, 'src/towns');
const INDEX_OUT = join(ROOT, 'src/towns-index.json');

/**
 * 将全量乡镇数据按省级前缀（区划代码前 2 位）分片写出
 */
const main = async () => {
  const towns = JSON.parse(await readFile(SRC, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });

  const byProv = new Map();
  const index = []; // 轻量搜索索引：[code, name, short, py, pi, unitCode]

  for (const [unitCode, list] of Object.entries(towns)) {
    const prefix = unitCode.slice(0, 2);
    let bucket = byProv.get(prefix);
    if (!bucket) {
      bucket = {};
      byProv.set(prefix, bucket);
    }
    bucket[unitCode] = list;
    for (const [code, name, short, py, pi] of list) {
      index.push([code, name, short, py, pi, unitCode]);
    }
  }

  for (const [prefix, data] of byProv) {
    const path = join(OUT_DIR, `${prefix}.json`);
    await writeFile(path, JSON.stringify(data));
    const count = Object.values(data).reduce((s, a) => s + a.length, 0);
    console.log(`  towns/${prefix}.json  ${Object.keys(data).length} 区县 / ${count} 乡镇`);
  }

  // 搜索索引单独文件，体积约为全量数据的一半（无坐标），按需加载
  await writeFile(INDEX_OUT, JSON.stringify(index));
  console.log(`✓ 已拆分 ${byProv.size} 个省级分片，搜索索引 ${index.length} 条`);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
