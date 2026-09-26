// 视图状态：集中管理当前省/市/区县与导航代际，避免散落 let 与竞态
// @author ygw

/**
 * 创建统一的视图状态仓库
 * @returns {object} 状态读写与导航代际 API
 */
export const createViewState = () => {
  const state = {
    activeProvince: null,
    activeCity: null,
    activeCounty: null,
    selectedTown: null,
    hoveredTarget: null,
    home: null,
    pendingFocus: null,
  };

  /** 导航代际：每次进入新视图时自增，await 后比对可丢弃过期导航 */
  let navGeneration = 0;

  /**
   * 开始一次新导航，返回本代 token
   * @returns {number}
   */
  const beginNav = () => ++navGeneration;

  /**
   * 判断导航是否仍为当前代
   * @param {number} gen
   * @returns {boolean}
   */
  const isCurrentNav = gen => gen === navGeneration;

  /**
   * 批量写入状态字段
   * @param {Partial<typeof state>} patch
   */
  const set = patch => {
    Object.assign(state, patch);
  };

  /**
   * 读取当前视图模式
   * @returns {'country'|'province'|'city'|'county'}
   */
  const viewMode = () => (
    state.activeCounty ? 'county'
      : state.activeCity ? 'city'
        : state.activeProvince ? 'province'
          : 'country'
  );

  return {
    state,
    get: key => state[key],
    set,
    beginNav,
    isCurrentNav,
    viewMode,
    get navGeneration() { return navGeneration; },
  };
};
