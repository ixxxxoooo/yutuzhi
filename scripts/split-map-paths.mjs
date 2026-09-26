#!/usr/bin/env node
// 将 map-data.json 中的区县路径拆出为 map-paths-coarse.json，主文件仅保留元数据
// @author ygw
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAP_DATA = join(ROOT, 'src/map-data.json');
const PATHS_OUT = join(ROOT, 'src/map-paths-coarse.json');

/**
 * 拆分粗精度路径：map-data 保留元数据，路径写入独立文件供动态加载
 */
const main = async () => {
  const data = JSON.parse(await readFile(MAP_DATA, 'utf8'));
  const paths = {};
  for (const u of data.units) {
    if (u.d) {
      paths[u.code] = u.d;
      delete u.d;
    }
  }
  // lines / outline / inset 仍放在 map-data（全国视图首屏必需，体积相对可控）
  await writeFile(PATHS_OUT, JSON.stringify(paths));
  await writeFile(MAP_DATA, JSON.stringify(data));
  const metaSize = (await readFile(MAP_DATA)).length;
  const pathSize = (await readFile(PATHS_OUT)).length;
  console.log(`✓ map-data.json（元数据） ${(metaSize / 1024).toFixed(0)} KB`);
  console.log(`✓ map-paths-coarse.json（路径） ${(pathSize / 1024).toFixed(0)} KB`);
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
