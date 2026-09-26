// 全局命名常量：动画、布局、交互阈值
// @author ygw

/** 省/市/区县名标签基准屏幕字号（像素） */
export const LABEL_PX = 13;
/** 全国视图放大后省名屏幕字号（像素） */
export const PROV_LABEL_PX = 14;
/** 全国视图放大到几倍后展开全部省名、换精细版 */
export const PROV_LABEL_ZOOM = 2;
/** 各视图最大放大倍数 */
export const MAX_ZOOM = { country: 16, province: 12, city: 12, county: 10 };
/** 全国视图未放大时省名字号（像素） */
export const PROV_LABEL_BASE_PX = 12.5;
/** 引线端点圆点半径（屏幕像素） */
export const LEADER_DOT = 3;
/** 飞行动画时长（毫秒） */
export const FLY_DURATION = 620;
/** 复位视图动画时长（毫秒） */
export const RESET_DURATION = 400;
/** 窗口重排动画时长（毫秒） */
export const REFIT_DURATION = 300;
/** 缩放后延迟重排标签（毫秒） */
export const LABEL_RELAYOUT_DELAY = 180;
/** 悬浮卡片距视口边缘 padding */
export const HOVER_CARD_PAD = 16;
/** 悬浮卡片相对光标偏移 */
export const HOVER_CARD_OFFSET = 18;
/** 悬浮卡片默认宽高 fallback */
export const HOVER_CARD_FALLBACK = { w: 280, h: 160 };
/** 标签布局相对可视区内缩（像素） */
export const LABEL_INSET = 6;
/** 标签字号阶梯比例 */
export const LABEL_SCALES = [1, 0.86, 0.74];
/** 三沙卡片相对 inset 偏移（像素） */
export const SANSHA_CARD_OFFSET = 16;
/** 三沙市地级代码 */
export const SANSHA_CITY_CODE = '460300';
/** 面板拖拽切换 collapsed 阈值（像素） */
export const PANEL_DRAG_THRESHOLD = 24;
/** 后台资源预加载最大重试次数 */
export const MAX_PRELOAD_RETRIES = 2;
/** 预加载重试基础间隔（毫秒） */
export const PRELOAD_RETRY_BASE_MS = 2000;
/** requestIdleCallback 超时（毫秒） */
export const IDLE_PRELOAD_TIMEOUT = 1200;
/** 无 idle 时预加载延迟（毫秒） */
export const PRELOAD_FALLBACK_DELAY = 300;
/** 搜索输入防抖（毫秒） */
export const SEARCH_DEBOUNCE_MS = 120;
/** setDetail 每帧更新的 path 数量 */
export const SET_DETAIL_BATCH = 200;
/** 长按触发区域信息的阈值（毫秒） */
export const LONG_PRESS_MS = 300;
