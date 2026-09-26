// 页面级的小工具
// @author ygw

export const $ = (sel, root = document) => root.querySelector(sel);

export const esc = s => String(s).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);

// 与 style.css 的断点一致：窄屏时侧栏在底部、搜索框收起为图标
export const narrowScreen = matchMedia('(max-width: 700px)');

/**
 * 创建防抖函数，在连续调用停止后延迟执行
 * @param {Function} fn - 需要防抖的函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Function} 防抖后的函数（附带 .cancel() 方法）
 */
export const debounce = (fn, ms) => {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};
