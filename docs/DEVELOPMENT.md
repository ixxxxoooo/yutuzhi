# 开发与架构文档 (Development Guide)

## 常用脚本命令

```bash
npm install
npm run dev     # 本地开发（启动前自动校验/生成字体子集）
npm run build   # 输出生产构建产物至 dist/
npm run check   # 自检：34省、地级、县级、乡镇数据完整性、边界无退化环、字体覆盖
npm run lint    # ESLint 检查
npm test        # Vitest 单元测试
npm run split-towns  # 乡镇数据按省分片
npm run split-paths  # 粗精度路径与元数据拆分
```

单独的数据处理步骤：

| 命令 | 作用 |
|---|---|
| `npm run fetch` | 下载 DataV 边界数据与得意黑原始字体到 `data/raw/`（已存在则跳过，`--force` 强制重下） |
| `npm run map` | 生成 `src/map-data.json` 与 `src/map-fine.json` |
| `npm run split-paths` | 将粗路径拆至 `map-paths-coarse.json`，元数据保留在 `map-data.json` |
| `npm run split-towns` | 按省级前缀拆分 `src/towns/XX.json`，并生成 `towns-index.json` |
| `npm run font` | 生成字体子集 `src/fonts/cityex-sans.woff2`（`dev`/`build` 会自动执行） |
| `npm run data` | 一键：fetch → map → split-paths → split-towns → font → check |

## 2026-09 全面优化改造进度

已完成（对应改造方案 P0–P3）：

- **P0** 导航竞态（`navGeneration` + 可取消 `animateView`）；towns 按省分片按需加载；map-data 路径/元数据拆分；字体 preload；export-map 动态 import
- **P1** Voronoi Web Worker（`voronoi.worker.js`）；`setDetail` 分帧；高亮层/`subD` 缓存；底图 evict/AbortController/切图层清缓存；`ViewState`；常量提取；导出 blob revoke
- **P2** SVG 键盘导航 + ARIA live；移动端长按与 44px 触控；OG/Twitter；ESLint/Prettier；TS `allowJs` + `types.d.ts`
- **P3** PWA（vite-plugin-pwa）；Vitest；CI（lint/test/check/build/体积/Lighthouse a11y）

## 数据处理与渲染架构

- **四级行政区划**：覆盖 34 个省级行政区、370 个地级节点（333 个地级行政区 + 30 个省直辖县级单位 + 京津沪渝港澳台）、2,875 个县级行政区与 38,717 个乡镇/街道。
- **拓扑修复与双级精度**：使用 `mapshaper` 对原始边界执行 `snap` 与 `-clean` 修复缝隙与重叠；全国视图默认加载粗精度轮廓（`map-data.json` 元数据 + `map-paths-coarse.json`），进入省/市/县视图或开启真实底图时无缝切换为高精度轮廓（`src/map-fine.json`）。
- **四级乡镇真实坐标剖分**：基于国家统计局四级行政区划代码与民政部/高德真实乡镇驻地坐标（GCJ-02），在 Albers 等积圆锥投影下对区县精细多边形执行半平面裁剪 Voronoi 剖分；大区县（≥12 街镇）走 Web Worker，避免主线程卡顿。
- **拓扑邻接着色与外轮廓提取**：通过共享边界顶点构建拓扑邻接图，为同级相邻区域分配互不冲突的六色舆图色板；同时在运行时消去内部公共边，实时提取省/市/区县最外圈完整边界用于立体外框与悬停焦点环绘制。
- **字体子集化**：界面使用[得意黑 Smiley Sans](https://github.com/atelier-anchor/smiley-sans)（SIL OFL 1.1），按协议子集化后重命名为 **CityEx Sans**，输出至 `src/fonts/cityex-sans.woff2`。
- **数据按需加载**：乡镇按省 32 个分片（`src/towns/XX.json`）进入区县时再加载；搜索索引 `towns-index.json` 按需；取消 idle 全量预加载 towns。
