# 贡献指南 (Contributing to YuTuZhi)

感谢你对 **YuTuZhi（舆图志）** 项目的关注与支持！欢迎通过 Issue 或 Pull Request 参与共建。

## 1. 开发流程

1. Fork 本仓库并克隆到本地：
   ```bash
   git clone https://github.com/<your-username>/yutuzhi.git
   cd yutuzhi
   npm install
   ```
2. 创建功能或修复分支：
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. 启动本地开发服务进行调试：
   ```bash
   npm run dev
   ```
4. 提交前请确保通过数据与构建自检：
   ```bash
   npm run check
   npm run build
   ```

## 2. 行政区划与乡镇数据勘误

如果你发现某处区县或乡镇/街道的名称、区划代码或驻地位置与最新官方区划存在偏差，欢迎提交 Issue 或 PR：
- 请尽量附上民政部或国家统计局的官方变更批复或统计用区划代码作为参考依据。
- 修改界面文案或新增生僻地名字符后，若本地存有 `data/raw/font/SmileySans-Oblique.ttf`，请运行 `npm run font` 更新 `src/fonts/cityex-sans.woff2`。

## 3. 代码规范

- 本项目采用原生 ES Modules（Vanilla JS）+ Vite 构建，保持零运行时框架依赖与轻量高性能。
- 地图矢量路径与视觉层级样式集中在 `src/map.js` 与 `src/style.css` 中维护。
