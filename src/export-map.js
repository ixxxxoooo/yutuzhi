// 导出当前选中区域（全国 / 省 / 市 / 区县）的高清舆图卡片 PNG
import {
  FULL_VIEW, provinceView, cityView, unitView,
  provinces, citiesOf, unitsOfCity, townsOfUnit,
  unitPath, cityPath, townPath,
  provinceByCode, cityByCode, unitByCode, spotsOfRegion,
} from './map.js';
import { layoutLabels, leaderEnd, layoutCityPoints } from './label-layout.js';

const FONT = '"CityEx Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

const TOURISM_COLORS = {
  nature: '#15803d',
  heritage: '#b91c1c',
  water: '#0369a1',
  wonder: '#b45309',
};

export const getSaveButtonLabel = ({ activeProvince, activeCity, activeCounty }) => {
  if (activeCounty) {
    const u = unitByCode.get(activeCounty);
    return `保存${u?.short || '区县'}图`;
  }
  if (activeCity) {
    const c = cityByCode.get(activeCity);
    return `保存${c?.short || '城市'}图`;
  }
  if (activeProvince) {
    const p = provinceByCode.get(activeProvince);
    return `保存${p?.short || '省份'}图`;
  }
  return '保存全国图';
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
};

const drawStar = (ctx, cx, cy, outerR, innerR) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

const drawCityPointMarker = (ctx, px, py, tier) => {
  if (tier === 'country') {
    ctx.beginPath();
    ctx.arc(px, py, 6.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 5.1, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    drawStar(ctx, px, py, 3.6, 1.45);
    ctx.fillStyle = '#fde047';
    ctx.fill();
  } else if (tier === 'province' || tier === 'city') {
    ctx.beginPath();
    ctx.arc(px, py, 5.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 4.1, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = '#dc2626';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(px, py, 4.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 1.35, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
  }
};

const drawTourismMarker = (ctx, px, py, cat, tier) => {
  const color = TOURISM_COLORS[cat] || '#15803d';
  const r = tier === 1 ? 5.2 : 4.5;
  ctx.beginPath();
  ctx.arc(px, py, r + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px, py, 2.1, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
};

// 将当前 #map 的矢量图层内联计算样式并光栅化为指定宽高与 viewBox 的图像
const renderSvgGeometryToImage = (liveSvg, box, width, height, scale, hideInset) => new Promise((resolve, reject) => {
  const root = document.documentElement;
  const prevBasemap = root.dataset.basemap;
  const prevDark = root.dataset.basemapDark;
  if (prevBasemap !== undefined) delete root.dataset.basemap;
  if (prevDark !== undefined) delete root.dataset.basemapDark;

  const clone = liveSvg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('viewBox', box.join(' '));
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // 移除文字、引线、城市点位、名胜点位与未使用的占位节点（稍后在 Canvas 上使用 CityEx Sans 高清绘制）
  for (const q of ['.prov-labels', '.city-labels', '.labels', '.town-labels', '.city-points', '.tourism-points', '.hover-layer', '.line-county']) {
    clone.querySelector(q)?.remove();
  }
  if (hideInset) {
    clone.querySelector('.inset')?.remove();
  }

  try {
    // 按选择器逐类同步原 SVG 节点上的有效计算样式到 clone 对应节点
    const syncSelector = sel => {
      const srcList = liveSvg.querySelectorAll(sel);
      const dstList = clone.querySelectorAll(sel);
      const len = Math.min(srcList.length, dstList.length);
      for (let i = 0; i < len; i++) {
        const cs = getComputedStyle(srcList[i]);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') {
          dstList[i].remove();
          continue;
        }
        dstList[i].setAttribute('fill', cs.fill || 'none');
        dstList[i].setAttribute('stroke', cs.stroke || 'none');
        if (cs.stroke && cs.stroke !== 'none' && cs.stroke !== 'rgba(0, 0, 0, 0)') {
          dstList[i].setAttribute('stroke-width', cs.strokeWidth || '1px');
          dstList[i].setAttribute('stroke-linejoin', 'round');
          dstList[i].setAttribute('stroke-linecap', 'round');
          dstList[i].setAttribute('vector-effect', 'non-scaling-stroke');
          if (cs.strokeDasharray && cs.strokeDasharray !== 'none') {
            dstList[i].setAttribute('stroke-dasharray', cs.strokeDasharray);
          }
        }
      }
    };

    syncSelector('.sea');
    syncSelector('.map-shadow');
    syncSelector('.prov .unit');
    syncSelector('.towns-layer .town');
    syncSelector(':scope > .line-city, :scope > .line-province, :scope > .line-country');
    syncSelector('.active-parent-outline, .subline-casing, .subline-stroke, .active-shadow, .active-halo, .active-outline, .select-halo, .select-outline');
    if (!hideInset) {
      syncSelector('.inset rect, .inset path');
    }
  } finally {
    if (prevBasemap !== undefined) root.dataset.basemap = prevBasemap;
    if (prevDark !== undefined) root.dataset.basemapDark = prevDark;
  }

  // 兜底：确保任何非 defs 内的 path 都有显式 fill 属性，避免 SVG 默认黑色填充
  for (const p of clone.querySelectorAll('path')) {
    if (!p.closest('defs') && !p.hasAttribute('fill')) {
      p.setAttribute('fill', 'none');
    }
  }

  // 补充硬投影偏移（屏幕像素 3px, 5px 换算为 viewBox 单位）
  const dx = (3 / scale).toFixed(2);
  const dy = (5 / scale).toFixed(2);
  for (const sh of clone.querySelectorAll('.map-shadow, .inset-shadow')) {
    sh.setAttribute('transform', `translate(${dx}, ${dy})`);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    resolve(img);
  };
  img.onerror = err => {
    URL.revokeObjectURL(url);
    reject(err);
  };
  img.src = url;
});

export const generateMapPoster = async ({
  svg,
  activeProvince,
  activeCity,
  activeCounty,
  regionInfo,
}) => {
  await document.fonts?.ready;

  const isCountry = !activeProvince;
  const box = activeCounty
    ? unitView(activeCounty, 0.14)
    : activeCity
      ? cityView(activeCity, 0.12)
      : activeProvince
        ? provinceView(activeProvince, 0.12)
        : FULL_VIEW;

  // 画布逻辑尺寸（CSS 像素），以 2 倍超采样输出高清 PNG
  const DPR = 2;
  const W = 1080;
  const headerH = 148;
  const footerH = 66;
  const pad = 28;
  const mapW = W - pad * 2;
  const rawRatio = box[3] / box[2];
  const clampedRatio = Math.min(1.05, Math.max(0.68, rawRatio));
  const mapH = Math.round(mapW * clampedRatio);
  const H = headerH + mapH + footerH + pad;

  // 计算适配 mapW x mapH 的等比 viewBox
  const s = Math.min(mapW / box[2], mapH / box[3]);
  const fitBox = [
    box[0] - (mapW / s - box[2]) / 2,
    box[1] - (mapH / s - box[3]) / 2,
    mapW / s,
    mapH / s,
  ];

  const mapImg = await renderSvgGeometryToImage(svg, fitBox, mapW * DPR, mapH * DPR, s, !isCountry);

  const canvas = document.createElement('canvas');
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // 1. 整体背景
  ctx.fillStyle = '#f3efe6';
  ctx.fillRect(0, 0, W, H);

  // 2. 顶部信息栏卡片
  const headY = 22;
  const headH = headerH - 34;
  roundRect(ctx, pad, headY, mapW, headH, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#222222';
  ctx.stroke();

  // 标题 + 徽章 + 副标题
  ctx.fillStyle = '#222222';
  ctx.font = `bold 30px ${FONT}`;
  ctx.textBaseline = 'top';
  ctx.fillText(regionInfo.title, pad + 20, headY + 16);
  const titleW = ctx.measureText(regionInfo.title).width;

  // 徽章
  ctx.font = `bold 13px ${FONT}`;
  const badgeText = regionInfo.badge;
  const badgeW = ctx.measureText(badgeText).width + 16;
  const badgeX = pad + 20 + titleW + 12;
  const badgeY = headY + 21;
  roundRect(ctx, badgeX, badgeY, badgeW, 22, 5);
  ctx.fillStyle = '#fde047';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#222222';
  ctx.stroke();
  ctx.fillStyle = '#222222';
  ctx.fillText(badgeText, badgeX + 8, badgeY + 4);

  // 副标题
  ctx.fillStyle = '#6b665c';
  ctx.font = `14px ${FONT}`;
  ctx.fillText(regionInfo.sub, pad + 20, headY + 54);

  // 右侧 4 项关键统计指标
  const stats = regionInfo.stats || [];
  const statW = 142;
  const statGap = 10;
  const totalStatsW = stats.length * statW + Math.max(0, stats.length - 1) * statGap;
  let statX = pad + mapW - 18 - totalStatsW;
  for (const st of stats) {
    roundRect(ctx, statX, headY + 14, statW, headH - 28, 8);
    ctx.fillStyle = '#f6f3ec';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d8d2c4';
    ctx.stroke();

    ctx.fillStyle = '#6b665c';
    ctx.font = `12px ${FONT}`;
    ctx.fillText(st.label, statX + 10, headY + 22);

    ctx.fillStyle = '#222222';
    ctx.font = `bold 18px ${FONT}`;
    ctx.fillText(st.value, statX + 10, headY + 40);

    ctx.fillStyle = '#6b665c';
    ctx.font = `11px ${FONT}`;
    const note = st.note.length > 12 ? st.note.slice(0, 12) + '…' : st.note;
    ctx.fillText(note, statX + 10, headY + 65);

    statX += statW + statGap;
  }

  // 3. 地图主画框
  const mapX = pad;
  const mapY = headerH;
  ctx.save();
  roundRect(ctx, mapX + 4, mapY + 6, mapW, mapH, 14);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fill();

  roundRect(ctx, mapX, mapY, mapW, mapH, 14);
  ctx.fillStyle = '#f3efe6';
  ctx.fill();
  ctx.clip();

  ctx.drawImage(mapImg, mapX, mapY, mapW, mapH);

  // 4. 在地图画框内绘制行政区名称、引线与城市/驻地点位
  const hideLabels = Boolean(document.documentElement.dataset.hideLabels);
  const showCityPoints = Boolean(document.documentElement.dataset.cityPoints);
  const viewObj = { vx: fitBox[0], vy: fitBox[1], k: s };
  const boundsObj = { x0: 16, y0: 16, x1: mapW - 16, y1: mapH - 16 };
  const obstacles = [];

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (isCountry) {
    if (!hideLabels) {
      // 全国视图：绘制各省简称（开启省会点位时自动跳过直辖市与港澳同名省标）
      const SKIP = showCityPoints
        ? new Set(['110000', '120000', '310000', '500000', '810000', '820000'])
        : new Set(['810000', '820000']);
      ctx.font = `bold 13px ${FONT}`;
      ctx.lineJoin = 'round';
      for (const p of provinces) {
        if (SKIP.has(p.code) || !p.label) continue;
        const lx = (p.label[0] - fitBox[0]) * s;
        const ly = (p.label[1] - fitBox[1]) * s;
        const w = p.short.length * 13 + 6;
        obstacles.push({ x0: lx - w / 2, y0: ly - 8, x1: lx + w / 2, y1: ly + 8 });
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeText(p.short, mapX + lx, mapY + ly);
        ctx.fillStyle = showCityPoints ? '#575248' : '#222222';
        ctx.fillText(p.short, mapX + lx, mapY + ly);
      }
    }
    // 南海诸岛文字
    const [bx, by, bw, bh] = [530, 445, 95, 115];
    const ix = mapX + (bx + bw - 7 - fitBox[0]) * s;
    const iy = mapY + (by + bh - 7 - fitBox[1]) * s;
    ctx.textAlign = 'right';
    ctx.font = `11px ${FONT}`;
    ctx.fillStyle = '#6b665c';
    ctx.fillText('南海诸岛', ix, iy);
  } else if (!hideLabels && (!showCityPoints || (!activeCounty && !activeCity))) {
    // 省 / 市 / 区县视图：调用 layoutLabels 自动排布子区域标签与引线
    // 当开启城市/驻地点位时，仅保留省视图下自治州/盟（州名与首府名不同）的政区面标签
    let items = [];
    let pathOf = unitPath;
    if (activeCounty) {
      items = townsOfUnit(activeCounty).filter(t => t.d && t.label);
      pathOf = townPath;
    } else if (activeCity) {
      items = unitsOfCity(activeCity).filter(u => u.d && u.label);
      pathOf = unitPath;
    } else if (activeProvince) {
      items = citiesOf(activeProvince).filter(
        c => c.bbox && c.label && (!showCityPoints || (c.seatName && c.seatName !== c.short)),
      );
      pathOf = cityPath;
    }

    const { labels } = layoutLabels({
      units: items,
      pathOf,
      view: viewObj,
      bounds: boundsObj,
      base: 14,
      scales: [1, 0.88, 0.76],
    });

    // 先画引线与端点圆点
    for (const l of labels) {
      if (!l.leader) continue;
      const [ax, ay] = l.leader;
      const [ex, ey] = leaderEnd(l);
      ctx.beginPath();
      ctx.moveTo(mapX + ax, mapY + ay);
      ctx.lineTo(mapX + ex, mapY + ey);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#222222';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mapX + ax, mapY + ay, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#222222';
      ctx.stroke();
    }

    // 再画标签文字
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (const l of labels) {
      const fontSize = Math.round(l.s);
      const w = l.u.short.length * fontSize + 6;
      obstacles.push({ x0: l.x - w / 2, y0: l.y - fontSize * 0.6, x1: l.x + w / 2, y1: l.y + fontSize * 0.6 });
      ctx.font = `bold ${fontSize}px ${FONT}`;
      ctx.lineWidth = 4.2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeText(l.u.short, mapX + l.x, mapY + l.y);
      ctx.fillStyle = showCityPoints ? '#575248' : '#1e293b';
      ctx.fillText(l.u.short, mapX + l.x, mapY + l.y);
    }
  }

  // 若开启城市与省会位置图层，绘制符号化点位与避让后的点位名称
  if (showCityPoints) {
    let rawPoints = [];
    if (isCountry) {
      rawPoints = provinces.filter(p => p.seat).map(p => ({
        code: p.code,
        text: p.capital || p.short,
        seat: p.seat,
        tier: p.code === '110000' ? 'country' : 'province',
        priority: p.code === '110000' ? 1000000 : (p.code === '810000' || p.code === '820000' ? 10 : 1000 + (p.area || 0) / 10000),
      }));
    } else if (activeCounty) {
      rawPoints = townsOfUnit(activeCounty).filter(t => t.seat || t.label).map(t => ({
        code: t.code,
        text: t.short || t.name,
        seat: t.seat || t.label,
        tier: t.capital ? 'city' : 'normal',
        priority: t.capital ? 100000 : (t.area || 1),
      }));
    } else if (activeCity) {
      rawPoints = unitsOfCity(activeCity).filter(u => u.seat || u.label).map(u => ({
        code: u.code,
        text: u.short,
        seat: u.seat || u.label,
        tier: u.capital ? 'city' : 'normal',
        priority: u.capital ? 100000 : (u.area || 1),
      }));
    } else if (activeProvince) {
      rawPoints = citiesOf(activeProvince).filter(c => c.seat || c.label).map(c => ({
        code: c.code,
        text: c.seatName ? (!hideLabels ? c.seatName : `${c.short}·${c.seatName}`) : c.short,
        seat: c.seat || c.label,
        tier: c.capital ? 'province' : 'normal',
        priority: c.capital ? 1000000 : (c.area || 1),
      }));
    }

    const placedMap = layoutCityPoints({
      points: rawPoints,
      obstacles,
      view: viewObj,
      bounds: boundsObj,
      base: isCountry ? 12 : 13,
    });

    // 先统一画点位符号，再画文字，保证符号不被邻近文字遮盖、文字清晰可读
    for (const p of rawPoints) {
      const sx = (p.seat[0] - viewObj.vx) * viewObj.k;
      const sy = (p.seat[1] - viewObj.vy) * viewObj.k;
      drawCityPointMarker(ctx, mapX + sx, mapY + sy, p.tier);
    }
    ctx.lineJoin = 'round';
    ctx.textBaseline = 'middle';
    for (const p of rawPoints) {
      const layout = placedMap.get(p.code);
      if (!layout || !layout.showText) continue;
      const sx = (p.seat[0] - viewObj.vx) * viewObj.k;
      const sy = (p.seat[1] - viewObj.vy) * viewObj.k;
      const isCap = p.tier === 'country' || p.tier === 'province' || p.tier === 'city';
      ctx.font = `bold ${layout.fontSize}px ${FONT}`;
      ctx.textAlign = layout.anchor === 'end' ? 'right' : layout.anchor === 'middle' ? 'center' : 'left';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.strokeText(p.text, mapX + sx + layout.dx, mapY + sy + layout.dy);
      ctx.fillStyle = isCap ? '#991b1b' : '#1e293b';
      ctx.fillText(p.text, mapX + sx + layout.dx, mapY + sy + layout.dy);
    }
  }

  // 若开启文旅名胜风物图层，绘制名胜徽章与避让后的名称
  const tourismCat = document.documentElement.dataset.tourism;
  if (tourismCat) {
    const spots = spotsOfRegion({ activeProvince, activeCity, activeCounty, category: tourismCat });
    const tPoints = spots.map(sp => ({
      code: sp.id,
      text: sp.name,
      seat: sp.pos,
      cat: sp.cat,
      rawTier: sp.tier,
      tier: sp.tier === 1 ? 'country' : 'province',
      priority: (sp.tier === 1 ? 500000 : 10000) + (sp.worldHeritage ? 50000 : 0),
    }));
    const placedSpots = layoutCityPoints({
      points: tPoints,
      obstacles,
      view: viewObj,
      bounds: boundsObj,
      base: isCountry ? 11.5 : 12.5,
    });
    for (const sp of tPoints) {
      const sx = (sp.seat[0] - viewObj.vx) * viewObj.k;
      const sy = (sp.seat[1] - viewObj.vy) * viewObj.k;
      drawTourismMarker(ctx, mapX + sx, mapY + sy, sp.cat, sp.rawTier);
    }
    ctx.lineJoin = 'round';
    ctx.textBaseline = 'middle';
    for (const sp of tPoints) {
      const layout = placedSpots.get(sp.code);
      if (!layout || !layout.showText) continue;
      const sx = (sp.seat[0] - viewObj.vx) * viewObj.k;
      const sy = (sp.seat[1] - viewObj.vy) * viewObj.k;
      ctx.font = `bold ${layout.fontSize}px ${FONT}`;
      ctx.textAlign = layout.anchor === 'end' ? 'right' : layout.anchor === 'middle' ? 'center' : 'left';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeText(sp.text, mapX + sx + layout.dx, mapY + sy + layout.dy);
      ctx.fillStyle = TOURISM_COLORS[sp.cat] || '#15803d';
      ctx.fillText(sp.text, mapX + sx + layout.dx, mapY + sy + layout.dy);
    }
  }
  ctx.restore();

  // 地图画框描边
  roundRect(ctx, mapX, mapY, mapW, mapH, 14);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#222222';
  ctx.stroke();

  // 5. 底部信息与 GitHub 仓库地址角标
  const footY = headerH + mapH + 20;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#6b665c';
  ctx.font = `13px ${FONT}`;
  const footText = regionInfo.foot || '中国省 · 市 · 区县 · 乡镇/街道 四级行政区划交互地图';
  const maxFoot = footText.length > 40 ? footText.slice(0, 40) + '…' : footText;
  ctx.fillText(maxFoot, pad + 4, footY + 14);

  const repoText = 'https://github.com/ixxxxoooo/yutuzhi';
  const brandText = '  ·  YuTuZhi 舆图志';
  ctx.textAlign = 'right';
  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = '#222222';
  ctx.fillText(brandText, W - pad - 4, footY + 14);
  const brandW = ctx.measureText(brandText).width;

  ctx.font = `13px ui-monospace, SFMono-Regular, Menlo, ${FONT}`;
  ctx.fillStyle = '#4b473f';
  ctx.fillText(repoText, W - pad - 4 - brandW, footY + 14);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const cleanName = regionInfo.title.replace(/\s+/g, '');
      resolve({ url, blob, filename: `舆图志-${cleanName}.png` });
    }, 'image/png');
  });
};
