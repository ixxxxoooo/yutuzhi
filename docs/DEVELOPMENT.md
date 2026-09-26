# 开发与架构文档 (Development Guide)

## 常用脚本命令

```bash
npm install
npm run dev     # 本地开发（启动前自动校验/生成字体子集）
npm run build   # 输出生产构建产物至 dist/
npm run check   # 自检：34省、370地级、2875县级、38717乡镇数据完整性、边界无退化环、字体覆盖
```

单独的数据处理步骤：

| 命令 | 作用 |
|---|---|
| `npm run fetch` | 下载 DataV 边界数据与得意黑原始字体到 `data/raw/`（已存在则跳过，`--force` 强制重下） |
| `npm run map` | 生成 `src/map-data.json` 与 `src/map-fine.json` |
| `npm run font` | 生成字体子集 `src/fonts/cityex-sans.woff2`（`dev`/`build` 会自动执行） |

`dist/` 是纯静态文件，使用相对路径（`base: './'`），可以直接部署在 Vercel、GitHub Pages、Cloudflare Pages 或任意静态服务器上。

## 部署到 Vercel

1. 将仓库推送到 GitHub（`https://github.com/ixxxxoooo/yutuzhi`）。
2. 在 [Vercel](https://vercel.com/) 中点击 **Add New → Project**，导入该 GitHub 仓库。构建配置已写在 `vercel.json` 中（`npm ci` → `npm run build` → `dist/`），无需手动填写。
3. 如需绑定自定义域名并在中国大陆获得更佳访问速度，可在 Vercel 项目的 **Settings → Domains** 添加自定义域名，并将 DNS CNAME 指向 `cname-china.vercel-dns.com`。
4. 之后每次推送到 `main` 分支都会触发自动构建与发布。

> **字体子集说明**：CI / Vercel 构建环境里没有 `data/raw/`（未纳入版本管理），因此构建时会自动沿用已提交的 `src/fonts/cityex-sans.woff2` 并校验常用字符覆盖率。
