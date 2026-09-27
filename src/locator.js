// 定位菜单：顶栏搜索框获得焦点时展开。无输入时为 省份 → 地级市 → 区县 → 乡镇/街道 四级；有输入时为搜索结果
// @author ygw
import {
  provinces, provinceByCode, cities, cityByCode, citiesOf, units, unitByCode, unitsOf, unitsOfCity,
  getRawTowns, getTownsIndex, loadTownsIndex, loadTownsForProvince, TOURISM_SPOTS,
} from './map.js';
import { esc, narrowScreen, debounce } from './dom.js';
import { SEARCH_DEBOUNCE_MS } from './constants.js';

const REGIONS = [
  ['华北', '1'], ['东北', '2'], ['华东', '3'], ['中南', '4'], ['西南', '5'], ['西北', '6'], ['港澳台', '78'],
];
const MAX_RESULTS = 45;

// 搜索：中文名 / 简称 / 区划代码，或拼音（全拼、首字母）
const score = (item, q) => {
  if (/^\d+$/.test(q)) {
    if (item.code === q) return 0;
    return item.code?.startsWith(q) ? 1 : -1;
  }
  if (/[\u4e00-\u9fff]/.test(q)) {
    if (item.short === q || item.name === q) return 0;
    return item.name.includes(q) || item.short.includes(q) ? 1 : -1;
  }
  const a = q.toLowerCase().replace(/[\s']/g, '');
  if (!a || !/^[a-z]+$/.test(a)) return -1;
  if (item.py === a) return 2;
  if (item.py.startsWith(a)) return 3;
  if (item.pi.startsWith(a)) return 4;
  return item.py.includes(a) ? 5 : -1;
};

/**
 * 四级全文检索 + 文旅名胜风物检索
 * @param {string} q - 查询词
 * @returns {Array}
 */
export const search = q => {
  const hits = [];

  for (const p of provinces) {
    if (p.single) continue;
    const s = score(p, q);
    if (s >= 0) hits.push({ item: { code: p.code, province: p.code, isProvince: true, name: p.name }, s });
  }

  for (const c of cities) {
    if (c.single || provinceByCode.get(c.province).direct) continue;
    const s = score(c, q);
    if (s >= 0) hits.push({ item: { code: c.code, cityCode: c.code, province: c.province, isCityGroup: true, name: c.name }, s });
  }

  for (const u of units) {
    const s = score(u, q);
    if (s >= 0) hits.push({ item: u, s });
  }

  for (const sp of TOURISM_SPOTS) {
    const s = score({ code: sp.unit, name: sp.fullName, short: sp.name, py: sp.py, pi: sp.pi }, q);
    if (s >= 0) hits.push({ item: { ...sp, isSpot: true }, s: s + 0.25 });
  }

  // 乡镇：优先用轻量搜索索引；未加载时回退到已加载省级分片
  if (q.length >= 2) {
    let townHits = 0;
    const index = getTownsIndex();
    if (index) {
      for (const [code, name, short, py, pi, unitCode] of index) {
        const s = score({ code, name, short, py, pi }, q);
        if (s >= 0) {
          hits.push({ item: { code, name, short, unitCode, isTown: true }, s: s + 0.5 });
          if (++townHits >= 80) break;
        }
      }
    } else {
      const rawTowns = getRawTowns();
      if (rawTowns) {
        for (const [unitCode, list] of Object.entries(rawTowns)) {
          for (const [code, name, short, py, pi] of list) {
            const s = score({ code, name, short, py, pi }, q);
            if (s >= 0) {
              hits.push({ item: { code, name, short, unitCode, isTown: true }, s: s + 0.5 });
              if (++townHits >= 80) break;
            }
          }
          if (townHits >= 80) break;
        }
      }
    }
  }

  return hits.sort((a, b) => a.s - b.s).map(h => h.item);
};

export const createLocator = ({ box, panel, onTown, onUnit, onCity, onProvince, onSpot, getActiveProvince, getActiveCity, getActiveCounty }) => {
  const input = box.querySelector('input');
  const topbar = box.closest('#topbar');
  const body = panel.querySelector('.locator-body');
  let currentProv = null;   // 当前展开的省
  let currentCity = null;   // 当前展开的地级市
  let currentCounty = null; // 当前展开的区县

  const renderProvinces = () => {
    body.innerHTML = REGIONS.map(([name, digits]) => {
      const items = provinces.filter(p => digits.includes(p.code[0]));
      return `<section><h3>${name}</h3><div class="loc-grid">${items.map(p => p.single
        ? `<button data-unit="${p.code}">${esc(p.short)}</button>`
        : `<button data-prov-drill="${p.code}">${esc(p.short)}<small>${unitsOf(p.code).length}县区</small></button>`).join('')}</div></section>`;
    }).join('');
  };

  const renderProvinceCities = provCode => {
    const p = provinceByCode.get(provCode);
    const pCities = citiesOf(provCode);
    body.innerHTML = `<div class="loc-head">
        <button data-back-prov aria-label="返回省份列表">‹ 省份</button>
        <b>${esc(p.name)}</b>
        <button data-view-province="${provCode}">查看全省</button>
      </div>
      <div class="loc-grid">${pCities.map(c => c.single
        ? `<button data-county-drill="${c.code}" title="${esc(c.name)}">${esc(c.short)}<small>${unitByCode.get(c.code)?.towns || 0}镇街</small></button>`
        : `<button data-city-drill="${c.code}" title="${esc(c.name)}">${esc(c.short)}<small>${unitsOfCity(c.code).length}县区</small></button>`).join('')}</div>`;
  };

  const renderCityUnits = cityCode => {
    const c = cityByCode.get(cityCode);
    const p = provinceByCode.get(c.province);
    const head = p.direct
      ? `<div class="loc-head">
          <button data-back-prov aria-label="返回省份列表">‹ 省份</button>
          <b>${esc(p.name)}</b>
          <button data-view-province="${p.code}">查看全市</button>
        </div>`
      : `<div class="loc-head">
          <button data-back-city aria-label="返回${esc(p.name)}">‹ ${esc(p.short)}</button>
          <b>${esc(c.name)}</b>
          <button data-view-city="${c.code}">查看全市</button>
        </div>`;
    body.innerHTML = head + `<div class="loc-grid">${unitsOfCity(cityCode).map(u =>
      u.towns
        ? `<button data-county-drill="${u.code}" title="${esc(u.name)}">${esc(u.short)}<small>${u.towns}镇街</small></button>`
        : `<button data-unit="${u.code}" title="${esc(u.name)}">${esc(u.short)}</button>`).join('')}</div>`;
  };

  const renderCountyTowns = unitCode => {
    const u = unitByCode.get(unitCode);
    const c = cityByCode.get(u.city);
    const p = provinceByCode.get(u.province);
    const rawTowns = getRawTowns();
    const list = rawTowns?.[unitCode] ?? [];
    const backAttr = c.single && !p.direct ? 'data-back-city' : 'data-back-county';
    const backLabel = c.single && !p.direct ? p.short : c.short;
    body.innerHTML = `<div class="loc-head">
        <button ${backAttr} aria-label="返回${esc(backLabel)}">‹ ${esc(backLabel)}</button>
        <b>${esc(u.name)}</b>
        <button data-unit="${u.code}">查看全区县</button>
      </div>
      <div class="loc-grid">${list.map(([code, name, short]) =>
        `<button data-town="${code}" data-town-unit="${unitCode}" title="${esc(name)}">${esc(short)}</button>`).join('')}</div>`;
  };

  const renderSearch = q => {
    const hits = search(q).slice(0, MAX_RESULTS);
    body.innerHTML = hits.length
      ? `<div class="loc-list">${hits.map(h => {
        if (h.isProvince) return `<button data-view-province="${h.province}"><b>${esc(h.name)}</b><small>省级 · ${unitsOf(h.province).length} 县区 · ${h.province}</small></button>`;
        if (h.isCityGroup) {
          const prov = provinceByCode.get(h.province);
          return `<button data-view-city="${h.cityCode}"><b>${esc(h.name)}</b><small>${esc(prov.short)} · ${unitsOfCity(h.cityCode).length} 县区 · ${h.cityCode}</small></button>`;
        }
        if (h.isSpot) {
          const prov = provinceByCode.get(h.prov);
          const city = cityByCode.get(h.city);
          const u = unitByCode.get(h.unit);
          const loc = city && !city.single && !prov?.direct
            ? `${prov?.short || ''} · ${city.short} · ${u?.short || ''}`
            : `${prov?.short || ''}${u && u.code !== prov?.code ? ` · ${u.short}` : ''}`;
          return `<button data-spot="${h.id}"><b>${esc(h.name)}</b><small>名胜 · ${esc(loc)} · ${esc(h.badge)}</small></button>`;
        }
        if (h.isTown) {
          const u = unitByCode.get(h.unitCode);
          const prov = provinceByCode.get(u.province);
          const city = cityByCode.get(u.city);
          const loc = city && !city.single && !prov.direct ? `${prov.short} · ${city.short} · ${u.short}` : `${prov.short} · ${u.short}`;
          return `<button data-town="${h.code}" data-town-unit="${h.unitCode}"><b>${esc(h.name)}</b><small>${esc(loc)} · ${h.code}</small></button>`;
        }
        const prov = provinceByCode.get(h.province);
        const city = cityByCode.get(h.city);
        const loc = city && !city.single && !prov.direct ? `${prov.short} · ${city.short}` : prov.short;
        return `<button data-unit="${h.code}"><b>${esc(h.name)}</b><small>${esc(loc)} · ${h.towns ? `${h.towns}镇街 · ` : ''}${h.code}</small></button>`;
      }).join('')}</div>`
      : '<p class="loc-empty">没有找到，试试省、市、区县、乡镇街道、名胜景区名、拼音或区划代码</p>';
  };

  const render = () => {
    const q = input.value.trim();
    if (q) renderSearch(q);
    else if (currentCounty) renderCountyTowns(currentCounty);
    else if (currentCity) renderCityUnits(currentCity);
    else if (currentProv) renderProvinceCities(currentProv);
    else renderProvinces();
  };

  const fitHeight = () => {
    if (panel.hidden) return;
    const vv = window.visualViewport;
    const bottom = vv ? vv.offsetTop + vv.height : innerHeight;
    panel.style.maxHeight = `${Math.max(160, Math.min(640, bottom - panel.getBoundingClientRect().top - 8))}px`;
  };
  window.visualViewport?.addEventListener('resize', fitHeight);

  const open = () => {
    if (!panel.hidden) return;
    // 打开时预热搜索索引（不阻塞 UI）
    loadTownsIndex().then(() => { if (!panel.hidden && input.value.trim()) render(); });
    currentProv = getActiveProvince();
    currentCity = getActiveCity();
    currentCounty = getActiveCounty?.() ?? null;
    if (currentCounty) {
      const u = unitByCode.get(currentCounty);
      if (u) loadTownsForProvince(u.province).then(() => { if (!panel.hidden) render(); });
    }
    topbar.classList.add('searching');
    render();
    panel.style.top = `${topbar.getBoundingClientRect().bottom - 8}px`;
    panel.style.left = narrowScreen.matches ? '' : `${box.getBoundingClientRect().left}px`;
    panel.hidden = false;
    fitHeight();
    box.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    if (panel.hidden) return;
    panel.hidden = true;
    input.value = '';
    input.blur();
    topbar.classList.remove('searching');
    box.setAttribute('aria-expanded', 'false');
  };

  box.addEventListener('click', e => {
    e.stopPropagation();
    open();
    input.focus();
  });
  // 搜索防抖：避免每次击键都触发全量搜索
  const debouncedRender = debounce(() => {
    if (panel.hidden) return;
    const q = input.value.trim();
    if (q.length >= 2) loadTownsIndex().then(() => { if (!panel.hidden) render(); });
    else render();
  }, SEARCH_DEBOUNCE_MS);

  input.addEventListener('focus', open);
  input.addEventListener('input', () => {
    open();
    if (input.value.trim()) debouncedRender();
    else render();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') body.querySelector('button[data-spot], button[data-town], button[data-unit], button[data-view-city], button[data-view-province], button[data-county-drill], button[data-city-drill], button[data-prov-drill]')?.click();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      body.querySelector('button')?.focus();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  });

  panel.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const buttons = [...body.querySelectorAll('button')];
    const i = buttons.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const next = i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1);
    if (next < 0) input.focus();
    else buttons[Math.min(next, buttons.length - 1)].focus();
  });

  panel.addEventListener('click', e => {
    e.stopPropagation();
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-back-prov')) {
      currentProv = null;
      currentCity = null;
      currentCounty = null;
      render();
    } else if (b.hasAttribute('data-back-city')) {
      currentCity = null;
      currentCounty = null;
      render();
    } else if (b.hasAttribute('data-back-county')) {
      currentCounty = null;
      render();
    } else if (b.dataset.provDrill) {
      const p = provinceByCode.get(b.dataset.provDrill);
      currentProv = p.code;
      currentCity = p.direct ? p.code : null;
      currentCounty = null;
      input.value = '';
      render();
    } else if (b.dataset.cityDrill) {
      currentCity = b.dataset.cityDrill;
      currentCounty = null;
      input.value = '';
      render();
    } else if (b.dataset.countyDrill) {
      currentCounty = b.dataset.countyDrill;
      input.value = '';
      const u = unitByCode.get(currentCounty);
      if (u && getRawTowns()?.[currentCounty]) render();
      else if (u) loadTownsForProvince(u.province).then(render);
      else render();
    } else if (b.dataset.viewProvince) {
      close();
      onProvince(b.dataset.viewProvince);
    } else if (b.dataset.viewCity) {
      close();
      onCity(b.dataset.viewCity);
    } else if (b.dataset.unit) {
      close();
      onUnit(b.dataset.unit);
    } else if (b.dataset.town) {
      close();
      onTown(b.dataset.town, b.dataset.townUnit);
    } else if (b.dataset.spot) {
      close();
      onSpot?.(b.dataset.spot);
    }
  });

  document.addEventListener('click', e => {
    if (!panel.hidden && !panel.contains(e.target) && !box.contains(e.target)) close();
  });

  return {
    close,
    isOpen: () => !panel.hidden,
    refresh: () => { if (!panel.hidden) render(); },
  };
};
