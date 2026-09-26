// 真实地图底图与图层控制：将 Web Mercator (EPSG:3857) 瓦片实时重投影到与 SVG 完全一致的 Albers 等积圆锥坐标系
// 支持 WebGL 硬件加速网格渲染（无接缝、60fps 缩放平移）与父级瓦片兜底（缩放加载时不闪白）

const DEG = Math.PI / 180;
const PHI0 = 25 * DEG;
const PHI1 = 47 * DEG;
const LAM0 = 105 * DEG;
const N_CONE = (Math.sin(PHI0) + Math.sin(PHI1)) / 2;
const C_CONE = 1 + Math.sin(PHI0) * Math.sin(PHI1);

// 与 scripts/build-map.mjs 完全一致的投影参数（PAD = 16, WIDTH = 1000）
const PAD = 16;
const BX0 = -0.41107467;
const BY0 = 1.05083385;
const PROJ_K = 1279.457409;
const WORLD_SVG = 6400; // 全球宽度对应的等效 SVG 单位，用于换算瓦片缩放级别 z
const GRID = 4;         // 每个瓦片细分为 4×4 网格以精确贴合圆锥投影曲率

// 经纬度 (GCJ-02) -> SVG 坐标 (x, y)
export const lonLatToSvg = (lon, lat) => {
  const r = Math.sqrt(Math.max(0, C_CONE - 2 * N_CONE * Math.sin(lat * DEG))) / N_CONE;
  const theta = N_CONE * (lon * DEG - LAM0);
  const fx = r * Math.sin(theta);
  const fy = r * Math.cos(theta);
  return [PAD + (fx - BX0) * PROJ_K, PAD + (fy - BY0) * PROJ_K];
};

// SVG 坐标 (x, y) -> 经纬度 (GCJ-02)
export const svgToLonLat = (svgX, svgY) => {
  const fx = BX0 + (svgX - PAD) / PROJ_K;
  const fy = BY0 + (svgY - PAD) / PROJ_K;
  const theta = Math.atan2(fx, fy);
  const r2 = fx * fx + fy * fy;
  const sinPhi = Math.max(-1, Math.min(1, (C_CONE - r2 * N_CONE * N_CONE) / (2 * N_CONE)));
  return [(LAM0 + theta / N_CONE) / DEG, Math.asin(sinPhi) / DEG];
};

// WGS-84 -> GCJ-02（供 Esri 地形/晕渲等 WGS-84 瓦片与国内 GCJ-02 行政边界严丝合缝对齐）
const A_ELLIPSE = 6378245.0;
const EE = 0.00669342162296594323;
const outOfChina = (lon, lat) => lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
const transformLat = (x, y) => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  return ret;
};
const transformLon = (x, y) => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  return ret;
};
const wgs84ToGcj02 = (lon, lat) => {
  if (outOfChina(lon, lat)) return [lon, lat];
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = lat * DEG;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((A_ELLIPSE * (1 - EE)) / (magic * sqrtMagic) * Math.PI);
  dLon = (dLon * 180.0) / (A_ELLIPSE / sqrtMagic * Math.cos(radLat) * Math.PI);
  return [lon + dLon, lat + dLat];
};

// Web Mercator 瓦片坐标换算
const lonToTileX = (lon, z) => ((lon + 180) / 360) * (1 << z);
const latToTileY = (lat, z) => {
  const sin = Math.sin(Math.max(-85.05, Math.min(85.05, lat)) * DEG);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * (1 << z);
};
const tileToLon = (x, z) => (x / (1 << z)) * 360 - 180;
const tileToLat = (y, z) => {
  const n = Math.PI - (2 * Math.PI * y) / (1 << z);
  return Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))) / DEG;
};

// ---------- 底图图层定义 ----------
export const BASEMAPS = [
  {
    id: 'paper',
    name: '极简白板',
    desc: '经典手绘卡片底图',
    crs: 'gcj02',
    url: null,
  },
  {
    id: 'street',
    name: '真实街道',
    desc: '水系 · 绿地 · 城市街道（放大后显示街道名）',
    crs: 'gcj02',
    minZ: 3,
    maxZ: 18,
    // 宏观层级（全国/省，z < 9）使用 scl=2 隐藏瓦片自带的模糊变形文字，仅保留纯净水系与道路底色；进入市县层级（z >= 9）再显示详细街道注记
    url: (z, x, y) => `https://wprd0${((x + y) & 3) + 1}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=${z >= 9 ? 1 : 2}&style=7&x=${x}&y=${y}&z=${z}`,
  },
  {
    id: 'satellite',
    name: '卫星影像',
    desc: '高清航拍遥感影像',
    crs: 'gcj02',
    dark: true,
    defaultRoadOverlay: false,
    minZ: 3,
    maxZ: 18,
    url: (z, x, y) => `https://webst0${((x + y) & 3) + 1}.is.autonavi.com/appmaptile?style=6&x=${x}&y=${y}&z=${z}`,
  },
  {
    id: 'topo',
    name: '地形地貌',
    desc: '山脉海拔 · 等高线 · 河流',
    crs: 'wgs84',
    defaultRoadOverlay: false,
    minZ: 3,
    maxZ: 16,
    url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}`,
  },
  {
    id: 'shaded',
    name: '山川晕渲',
    desc: '纯净自然地貌起伏',
    crs: 'wgs84',
    defaultRoadOverlay: false,
    minZ: 3,
    maxZ: 12,
    url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/${z}/${y}/${x}`,
  },
];

// 路网与地名注记叠加层（高德透明路网图层：宏观仅叠加主干路网，市县层级显示中文地名）
const ROAD_OVERLAY_LAYER = {
  id: 'amap-road-overlay',
  crs: 'gcj02',
  minZ: 7,
  maxZ: 18,
  url: (z, x, y) => `https://wprd0${((x + y) & 3) + 1}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=${z >= 9 ? 1 : 2}&style=8&x=${x}&y=${y}&z=${z}`,
};

export const basemapById = new Map(BASEMAPS.map(b => [b.id, b]));

// ---------- WebGL 渲染器 ----------
const createGLRenderer = canvas => {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;

  const vsSrc = `
    attribute vec2 aSvgPos;
    attribute vec2 aUV;
    uniform vec4 uTransform; // (ox, oy, sx, sy) 将 svgPos 转为像素坐标
    uniform vec2 uCanvas;    // (width, height)
    varying vec2 vUV;
    void main() {
      vec2 px = uTransform.xy + aSvgPos * uTransform.zw;
      vec2 clip = (px / uCanvas) * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      vUV = aUV;
    }
  `;
  const fsSrc = `
    precision mediump float;
    varying vec2 vUV;
    uniform sampler2D uTex;
    void main() {
      gl_FragColor = texture2D(uTex, vUV);
    }
  `;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const aSvgPos = gl.getAttribLocation(prog, 'aSvgPos');
  const aUV = gl.getAttribLocation(prog, 'aUV');
  const uTransform = gl.getUniformLocation(prog, 'uTransform');
  const uCanvas = gl.getUniformLocation(prog, 'uCanvas');

  // 共享 UV 与索引缓冲（(GRID+1) × (GRID+1) 顶点）
  const uvData = new Float32Array((GRID + 1) * (GRID + 1) * 2);
  let p = 0;
  for (let j = 0; j <= GRID; j++) {
    for (let i = 0; i <= GRID; i++) {
      uvData[p++] = i / GRID;
      uvData[p++] = j / GRID;
    }
  }
  const uvBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
  gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);

  const indices = new Uint16Array(GRID * GRID * 6);
  let idx = 0;
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const r0 = j * (GRID + 1) + i;
      const r1 = (j + 1) * (GRID + 1) + i;
      indices[idx++] = r0;
      indices[idx++] = r0 + 1;
      indices[idx++] = r1;
      indices[idx++] = r0 + 1;
      indices[idx++] = r1 + 1;
      indices[idx++] = r1;
    }
  }
  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  const posBuf = gl.createBuffer();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  const uploadTexture = img => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return tex;
  };

  const deleteTexture = tex => {
    if (tex) gl.deleteTexture(tex);
  };

  const beginFrame = (w, h, ox, oy, scale) => {
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(uCanvas, w, h);
    gl.uniform4f(uTransform, ox, oy, scale, scale);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  };

  const drawTile = (tile, subUV = null) => {
    if (!tile.tex) return;
    gl.bindTexture(gl.TEXTURE_2D, tile.tex);
    if (subUV) {
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, subUV, gl.DYNAMIC_DRAW);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, tile.verts, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aSvgPos);
    gl.vertexAttribPointer(aSvgPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    if (subUV) {
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.STATIC_DRAW);
    }
  };

  return { uploadTexture, deleteTexture, beginFrame, drawTile };
};

// 计算瓦片 (z, tx, ty) 对应的 (GRID+1)×(GRID+1) 个 SVG 顶点坐标
const computeTileVerts = (z, tx, ty, crs) => {
  const verts = new Float32Array((GRID + 1) * (GRID + 1) * 2);
  let p = 0;
  for (let j = 0; j <= GRID; j++) {
    const lat0 = tileToLat(ty + j / GRID, z);
    for (let i = 0; i <= GRID; i++) {
      const lon0 = tileToLon(tx + i / GRID, z);
      const [lon, lat] = crs === 'wgs84' ? wgs84ToGcj02(lon0, lat0) : [lon0, lat0];
      const [sx, sy] = lonLatToSvg(lon, lat);
      verts[p++] = sx;
      verts[p++] = sy;
    }
  }
  return verts;
};

// 计算父瓦片局部子区域的 UV 坐标（当高倍瓦片尚在加载时，用已加载的父瓦片局部纹理无缝垫底）
const computeSubUV = (u0, v0, scale) => {
  const uv = new Float32Array((GRID + 1) * (GRID + 1) * 2);
  let p = 0;
  for (let j = 0; j <= GRID; j++) {
    for (let i = 0; i <= GRID; i++) {
      uv[p++] = u0 + (i / GRID) * scale;
      uv[p++] = v0 + (j / GRID) * scale;
    }
  }
  return uv;
};

// ---------- 底图控制器 ----------
export const createBasemap = ({ canvas, svg, onStateChange }) => {
  const glRenderer = createGLRenderer(canvas);
  const cache = new Map(); // key: `${layerId}:${z}/${x}/${y}` -> tile
  const MAX_CACHE = 420;
  let rafId = 0;
  let lastView = null;

  // 状态（持久化到 localStorage）
  const STORAGE_KEY = 'china-map-explorer:layer-v2';
  const state = {
    basemap: 'paper',
    roadOverlay: false,
    countyGrid: false,
    showLabels: true,
    fillAlpha: 0.65,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && basemapById.has(saved.basemap)) {
      Object.assign(state, saved);
    } else {
      const legacy = JSON.parse(localStorage.getItem('china-ex-county:layer-state') || 'null');
      if (legacy && basemapById.has(legacy.basemap)) {
        state.basemap = legacy.basemap;
      }
    }
  } catch { /* 忽略 */ }

  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* 忽略 */ }
  };

  const applyDOMState = () => {
    const root = document.documentElement;
    const bm = basemapById.get(state.basemap) ?? BASEMAPS[0];
    if (bm.id === 'paper') {
      delete root.dataset.basemap;
      delete root.dataset.basemapDark;
      canvas.hidden = true;
    } else {
      root.dataset.basemap = bm.id;
      if (bm.dark) root.dataset.basemapDark = '1';
      else delete root.dataset.basemapDark;
      canvas.hidden = false;
    }
    if (state.countyGrid) root.dataset.countyGrid = '1';
    else delete root.dataset.countyGrid;
    if (!state.showLabels) root.dataset.hideLabels = '1';
    else delete root.dataset.hideLabels;
    root.style.setProperty('--fill-alpha', state.fillAlpha);
    onStateChange?.(state);
  };

  const scheduleRender = () => {
    if (rafId || state.basemap === 'paper') return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (lastView) render(lastView);
    });
  };

  const evictCache = () => {
    if (cache.size <= MAX_CACHE) return;
    const keys = [...cache.keys()];
    const removeCount = cache.size - MAX_CACHE + 60;
    for (let i = 0; i < removeCount; i++) {
      const k = keys[i];
      // 保留 z <= 5 的全国概览瓦片
      if (/:[345]\//.test(k)) continue;
      const t = cache.get(k);
      if (t?.tex) glRenderer?.deleteTexture(t.tex);
      cache.delete(k);
    }
  };

  const getTile = (layer, z, x, y) => {
    const key = `${layer.id}:${z}/${x}/${y}`;
    let tile = cache.get(key);
    if (tile) {
      // 刷新 LRU 顺序
      cache.delete(key);
      cache.set(key, tile);
      return tile;
    }
    tile = {
      key,
      z,
      x,
      y,
      ready: false,
      error: false,
      tex: null,
      verts: computeTileVerts(z, x, y, layer.crs),
    };
    cache.set(key, tile);
    evictCache();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (!cache.has(key)) return;
      tile.ready = true;
      if (glRenderer) tile.tex = glRenderer.uploadTexture(img);
      scheduleRender();
    };
    img.onerror = () => {
      tile.error = true;
    };
    img.src = layer.url(z, x, y);
    return tile;
  };

  // 计算当前可视范围对应的瓦片集合并绘制一层瓦片
  const renderLayer = (layer, zRange, x0, x1, y0, y1) => {
    const z = Math.max(layer.minZ ?? 3, Math.min(layer.maxZ ?? 17, zRange));
    const maxTile = (1 << z) - 1;
    const tx0 = Math.max(0, Math.floor(x0 * (1 << z)));
    const tx1 = Math.min(maxTile, Math.floor(x1 * (1 << z)));
    const ty0 = Math.max(0, Math.floor(y0 * (1 << z)));
    const ty1 = Math.min(maxTile, Math.floor(y1 * (1 << z)));

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const tile = getTile(layer, z, tx, ty);
        if (tile.ready) {
          glRenderer.drawTile(tile);
          continue;
        }
        // 若当前精度瓦片尚在加载，向上寻找已加载的父瓦片进行局部纹理垫底
        for (let d = 1; d <= 4 && z - d >= (layer.minZ ?? 3); d++) {
          const pz = z - d;
          const px = tx >> d;
          const py = ty >> d;
          const parent = cache.get(`${layer.id}:${pz}/${px}/${py}`);
          if (parent?.ready) {
            const scale = 1 / (1 << d);
            const u0 = (tx - (px << d)) * scale;
            const v0 = (ty - (py << d)) * scale;
            glRenderer.drawTile( { tex: parent.tex, verts: tile.verts }, computeSubUV(u0, v0, scale));
            break;
          }
        }
      }
    }
  };

  const render = view => {
    lastView = view;
    if (state.basemap === 'paper' || !glRenderer) return;
    const bm = basemapById.get(state.basemap);
    if (!bm?.url) return;

    const rect = svg.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(1, Math.round(rect.width * dpr));
    const H = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }

    const [vx, vy, vw, vh] = view;
    const s = Math.min(W / vw, H / vh);
    const ox = (W - vw * s) / 2 - vx * s;
    const oy = (H - vh * s) / 2 - vy * s;

    // 采样屏幕四边与中心 9 个点反推当前可见的经纬度范围
    let minLon = 180, maxLon = -180, minLat = 85, maxLat = -85;
    for (const u of [0, 0.5, 1]) {
      for (const v of [0, 0.5, 1]) {
        const sx = (u * W - ox) / s;
        const sy = (v * H - oy) / s;
        const [lon, lat] = svgToLonLat(sx, sy);
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
    // 适当外扩边界以覆盖圆锥投影弯曲边缘
    const padLon = (maxLon - minLon) * 0.08;
    const padLat = (maxLat - minLat) * 0.08;
    minLon = Math.max(-179.9, minLon - padLon);
    maxLon = Math.min(179.9, maxLon + padLon);
    minLat = Math.max(-80, minLat - padLat);
    maxLat = Math.min(80, maxLat + padLat);

    // 归一化 Web Mercator 范围 [0, 1]
    const x0 = lonToTileX(minLon, 0);
    const x1 = lonToTileX(maxLon, 0);
    const y0 = latToTileY(maxLat, 0);
    const y1 = latToTileY(minLat, 0);

    // 根据屏幕像素密度计算最匹配的瓦片级别 z
    const cssUpp = Math.max(vw / rect.width, vh / rect.height);
    const targetZ = Math.round(Math.log2(WORLD_SVG / (256 * cssUpp)));

    glRenderer.beginFrame(W, H, ox, oy, s);
    renderLayer(bm, targetZ, x0, x1, y0, y1);
    if (state.roadOverlay && bm.id !== 'street' && targetZ >= 7) {
      renderLayer(ROAD_OVERLAY_LAYER, targetZ, x0, x1, y0, y1);
    }
  };

  const setBasemap = id => {
    const bm = basemapById.get(id);
    if (!bm) return;
    const prev = state.basemap;
    state.basemap = id;
    if (prev !== id && bm.defaultRoadOverlay !== undefined) {
      state.roadOverlay = !!bm.defaultRoadOverlay;
    } else if (id === 'street' || id === 'paper') {
      state.roadOverlay = false;
    }
    saveState();
    applyDOMState();
    if (lastView) render(lastView);
  };

  const setOverlay = (key, value) => {
    state[key] = value;
    saveState();
    applyDOMState();
    if (lastView) render(lastView);
  };

  applyDOMState();

  return {
    getState: () => ({ ...state }),
    setBasemap,
    setOverlay,
    render,
  };
};

export const createLayerUI = ({ button, menu, basemap }) => {
  const labelEl = button.querySelector('#layer-btn-label');

  const syncUI = () => {
    const st = basemap.getState();
    const bm = basemapById.get(st.basemap) ?? BASEMAPS[0];
    labelEl.textContent = bm.id === 'paper' ? '图层' : `图层 · ${bm.name}`;
    button.classList.toggle('layer-active', bm.id !== 'paper' || st.countyGrid);
    if (menu.hidden) return;

    const canRoadOverlay = bm.id === 'satellite' || bm.id === 'shaded' || bm.id === 'topo';
    menu.innerHTML = `
      <div class="layer-sec">
        <h3>地图底图</h3>
        <div class="layer-grid">
          ${BASEMAPS.map(b => `
            <button type="button" class="layer-card${b.id === st.basemap ? ' active' : ''}" data-bm="${b.id}" aria-pressed="${b.id === st.basemap}">
              <i class="layer-swatch" data-swatch="${b.id}"></i>
              <span class="layer-meta"><b>${b.name}</b><small>${b.desc}</small></span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="layer-sec">
        <h3>叠加图层</h3>
        <div class="layer-toggles">
          <button type="button" class="layer-toggle${st.roadOverlay ? ' active' : ''}" data-toggle="roadOverlay" ${canRoadOverlay ? '' : 'disabled'} aria-pressed="${st.roadOverlay}">
            <span>路网与地名注记<small>${canRoadOverlay ? '在卫星/地形图上叠加道路与中文地名' : '仅卫星与地形底图可用'}</small></span>
            <i class="chk"></i>
          </button>
          <button type="button" class="layer-toggle${st.countyGrid ? ' active' : ''}" data-toggle="countyGrid" aria-pressed="${st.countyGrid}">
            <span>全局区县网格<small>在全国与省视图下常显 2875 个区县边界</small></span>
            <i class="chk"></i>
          </button>
          <button type="button" class="layer-toggle${st.showLabels ? ' active' : ''}" data-toggle="showLabels" aria-pressed="${st.showLabels}">
            <span>行政区划标签<small>显示省、市、区县名称标注</small></span>
            <i class="chk"></i>
          </button>
        </div>
      </div>
    `;
  };

  const open = () => {
    if (!menu.hidden) return;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    syncUI();
  };

  const close = () => {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  };

  button.addEventListener('click', e => {
    e.stopPropagation();
    if (menu.hidden) open();
    else close();
  });

  menu.addEventListener('click', e => {
    e.stopPropagation();
    const bmBtn = e.target.closest('button[data-bm]');
    if (bmBtn) {
      basemap.setBasemap(bmBtn.dataset.bm);
      syncUI();
      return;
    }
    const togBtn = e.target.closest('button[data-toggle]');
    if (togBtn && !togBtn.disabled) {
      const k = togBtn.dataset.toggle;
      const st = basemap.getState();
      basemap.setOverlay(k, !st[k]);
      syncUI();
    }
  });

  document.addEventListener('click', e => {
    if (!menu.hidden && !menu.contains(e.target) && !button.contains(e.target)) close();
  });

  syncUI();

  return {
    close,
    isOpen: () => !menu.hidden,
    sync: syncUI,
  };
};
