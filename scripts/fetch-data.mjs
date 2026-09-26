// 下载构建所需的原始数据到 data/raw/
//   100000_full.json           省级边界（取省名、九段线），阿里 DataV GeoAtlas
//   100000_full_city.json      全国市级边界（取地级市名与代码）
//   districts/{code}.json      各省/直辖市/特别行政区的区县级边界
//   font/                      得意黑 Smiley Sans（SIL OFL 1.1）
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE = 'https://geo.datav.aliyun.com/areas_v3/bound';
const OUT = new URL('../data/raw/', import.meta.url);
const DIST_DIR = new URL('districts/', OUT);
const FILES = ['100000_full.json', '100000_full_city.json'];
const force = process.argv.includes('--force');

await mkdir(DIST_DIR, { recursive: true });
for (const name of FILES) {
  const file = new URL(name, OUT);
  if (!force && await access(file).then(() => true, () => false)) continue;
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log('downloaded', name);
}

const china = JSON.parse(await readFile(new URL('100000_full.json', OUT), 'utf8'));
const provCodes = china.features
  .map(f => String(f.properties.adcode))
  .filter(c => /^\d{6}$/.test(c) && c !== '710000');

await Promise.all(provCodes.map(async code => {
  const file = new URL(`${code}.json`, DIST_DIR);
  if (!force && await access(file).then(() => true, () => false)) return;
  let res = await fetch(`${BASE}/${code}_full_district.json`);
  if (!res.ok) res = await fetch(`${BASE}/${code}_full.json`);
  if (!res.ok) throw new Error(`province ${code}: HTTP ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log('downloaded province districts', code);
}));

const FONT_ZIP = 'https://github.com/atelier-anchor/smiley-sans/releases/download/v2.0.1/smiley-sans-v2.0.1.zip';
const fontDir = new URL('font/', OUT);
if (force || !await access(new URL('SmileySans-Oblique.ttf', fontDir)).then(() => true, () => false)) {
  await mkdir(fontDir, { recursive: true });
  const res = await fetch(FONT_ZIP);
  if (!res.ok) throw new Error(`font: HTTP ${res.status}`);
  const zip = new URL('smiley-sans.zip', fontDir);
  await writeFile(zip, Buffer.from(await res.arrayBuffer()));
  execFileSync('unzip', ['-o', '-q', fileURLToPath(zip), '-d', fileURLToPath(fontDir)]);
  console.log('downloaded Smiley Sans');
}
console.log('ok');
