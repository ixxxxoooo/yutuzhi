// 地图平移缩放：单指/鼠标拖动平移，双指捏合与滚轮缩放。
// 直接操作 viewBox；要求 viewBox 宽高比与 svg 一致（由 fitView 保证），屏幕与地图坐标才是简单的线性关系。
import { currentView, stopAnimation, svgRect } from './map.js';

const DRAG_THRESHOLD = 6; // 像素，超过才算拖动，否则仍是点击

export const attachGestures = (svg, { getHome, maxZoom, canZoomOutLevel, onZoomOutLevel, onStart, onChange }) => {
  const pointers = new Map();
  let moved = false;
  let suppressClick = false;
  let snapBackTimer = 0;
  let lastWheelTime = 0;
  let levelCooldownUntil = 0;
  let waitWheelPause = false;

  // 允许在子层级（省/市/区县）继续向外缩小到 0.68x；当缩小比例低于 0.78x 时自动回退上一层级
  const MIN_ZOOM_SUB = 0.68;
  const MIN_ZOOM_ROOT = 0.88;
  const ZOOM_OUT_UP_RATIO = 0.78;

  const toMap = (view, x, y) => {
    const r = svgRect(svg);
    const k = view[2] / r.width;
    return [view[0] + (x - r.left) * k, view[1] + (y - r.top) * k, k];
  };

  const minZoom = () => (canZoomOutLevel?.() ? MIN_ZOOM_SUB : MIN_ZOOM_ROOT);

  // 视图宽度限制在 [home/maxZoom, home/minZoom] 之间
  const clampWidth = w => {
    const home = getHome();
    return Math.min(home[2] / minZoom(), Math.max(home[2] / maxZoom(), w));
  };

  // 放大时允许在边缘留出余量，确保鼠标指向边缘区域缩放时焦点不漂移；缩小时向 home 居中收拢
  const clamp = view => {
    const home = getHome();
    const w = clampWidth(view[2]);
    const h = w * (home[3] / home[2]);
    let x = view[0] + (view[2] - w) / 2;
    let y = view[1] + (view[3] - h) / 2;
    if (w >= home[2]) {
      // 处于缩小状态（w >= home[2]）：围绕 home 中心对称外扩
      x = home[0] - (w - home[2]) / 2;
      y = home[1] - (h - home[3]) / 2;
    } else {
      const slackX = w * 0.42;
      const slackY = h * 0.42;
      x = Math.min(Math.max(x, home[0] - slackX), home[0] + home[2] - w + slackX);
      y = Math.min(Math.max(y, home[1] - slackY), home[1] + home[3] - h + slackY);
    }
    return [x, y, w, h];
  };

  const apply = view => {
    const v = clamp(view);
    svg.setAttribute('viewBox', v.join(' '));
    onChange?.(v);
    return v;
  };

  // 以屏幕点 (x, y) 为中心缩放 factor 倍（>1 放大）
  const zoomAt = (x, y, factor, view = currentView(svg)) => {
    const [mx, my] = toMap(view, x, y);
    factor = view[2] / clampWidth(view[2] / factor);
    const w = view[2] / factor, h = view[3] / factor;
    return [mx - (mx - view[0]) / factor, my - (my - view[1]) / factor, w, h];
  };

  const scheduleSnapBack = () => {
    clearTimeout(snapBackTimer);
    snapBackTimer = setTimeout(() => {
      const home = getHome();
      const v = currentView(svg);
      if (home && v[2] > home[2] * 1.01) {
        apply(home);
      }
    }, 240);
  };

  const center = () => {
    const ps = [...pointers.values()];
    const x = ps.reduce((a, p) => a + p.x, 0) / ps.length;
    const y = ps.reduce((a, p) => a + p.y, 0) / ps.length;
    const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0;
    return { x, y, d };
  };

  let last = null;
  let startPoint = null;

  svg.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    clearTimeout(snapBackTimer);
    stopAnimation();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      moved = false;
      suppressClick = false;
      startPoint = { x: e.clientX, y: e.clientY };
    }
    last = center();
  });

  addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const now = center();
    if (!moved) {
      if (pointers.size < 2 && Math.hypot(e.clientX - startPoint.x, e.clientY - startPoint.y) < DRAG_THRESHOLD) return;
      moved = true;
      onStart?.();
    }
    let view = currentView(svg);
    if (pointers.size >= 2 && last.d && now.d) view = zoomAt(now.x, now.y, now.d / last.d, view);
    const k = view[2] / svgRect(svg).width;
    view[0] -= (now.x - last.x) * k;
    view[1] -= (now.y - last.y) * k;
    const applied = apply(view);
    const home = getHome();
    if (pointers.size >= 2 && home && canZoomOutLevel?.() && home[2] / applied[2] <= ZOOM_OUT_UP_RATIO) {
      const nowMs = performance.now();
      if (nowMs >= levelCooldownUntil) {
        levelCooldownUntil = nowMs + 700;
        pointers.clear();
        onZoomOutLevel?.();
        return;
      }
    }
    last = now;
  });

  const release = e => {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size) last = center();
    else {
      if (moved) suppressClick = true;
      scheduleSnapBack();
    }
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  // 拖动结束后浏览器仍会派发 click，在捕获阶段拦掉
  svg.addEventListener('click', e => {
    if (!suppressClick) return;
    suppressClick = false;
    e.stopImmediatePropagation();
  }, true);

  // 滚轮缩放：兼容鼠标滚轮刻度与触控板连续缩放，当在省/市/区县层级缩小越过阈值时自动回退上一层级
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const nowMs = performance.now();
    if (nowMs - lastWheelTime > 180) {
      waitWheelPause = false;
    }
    lastWheelTime = nowMs;

    if (nowMs < levelCooldownUntil) return;

    clearTimeout(snapBackTimer);
    stopAnimation();
    onStart?.();

    let rawDelta = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
    if ( rawDelta === 0 ) return;

    let expDelta;
    if (e.ctrlKey) {
      expDelta = Math.max(-0.28, Math.min(0.28, -rawDelta * 0.012));
    } else {
      const mag = Math.max(Math.abs(rawDelta), 22);
      expDelta = Math.max(-0.26, Math.min(0.26, -Math.sign(rawDelta) * mag * 0.0045));
    }

    const factor = Math.exp(expDelta);
    const nextView = apply(zoomAt(e.clientX, e.clientY, factor));
    const home = getHome();
    if (!home) return;

    const zoomRatio = home[2] / nextView[2];
    if (rawDelta > 0 && canZoomOutLevel?.() && !waitWheelPause && zoomRatio <= ZOOM_OUT_UP_RATIO) {
      levelCooldownUntil = nowMs + 680;
      waitWheelPause = true;
      onZoomOutLevel?.();
      return;
    }

    if (zoomRatio < 1) {
      scheduleSnapBack();
    }
  }, { passive: false });

  // Safari（含 iOS）的捏合走私有的 gesture 事件：在页面任何位置都拦下，否则会把整个页面放大、固定布局错乱
  for (const type of ['gesturestart', 'gesturechange']) document.addEventListener(type, e => e.preventDefault());
};

