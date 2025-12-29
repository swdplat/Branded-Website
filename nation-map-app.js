// ============================================================
// MyCard Map｜nation-map-app.js（整理註解版）
// - 功能：載入世界地圖 SVG、拖曳/縮放/雙指手勢、點擊地區顯示資訊卡、渲染各國金流、建立地圖下方國旗入口。
// - 重點：本檔只做「互動/狀態/資料串接」，視覺呈現以 nation-map-style.css 為主；兩者需同步維護。
// - 刪除影響：移除事件綁定或 transform 計算會讓地圖失去可用性（無法縮放/拖曳/點擊）。
// ============================================================
//
// [00] 基礎設定 / i18n（tr）
// [01] 滾動導引（service_map → world_map / mapFrame）
// [02] MapViewer：地圖載入、transform、手勢、點擊判定
// [03] 地圖下方其他地區（regionGrid）：依 country-payments 定義順序渲染
// [04] 國旗載入：依 ISO2 / 國名決定檔案候選清單
// [05] 金流顯示：模式切換（full/icon）、tooltip、行動版圓點與滑動同步
// ============================================================

// === [00] 基礎參數（路徑 / 尺寸 / 縮放界線） ===
// 功能：集中管理地圖資源路徑、初始尺寸、縮放上下限。
// 刪除影響：縮放/拖曳會失去界線，或地圖尺寸無法推算，容易出現「地圖飛走」。
// ------------------------------------------------------------
// === 可調參數 ===
const MAP_BASE  = './assest/map/';
let   FRAME_W   = 1895;
let   FRAME_H   = 800;
const MIN_ZOOM  = 1;
const MAX_ZOOM  = 8;
const ZOOM_STEP = 0.12;

// 注意：不要用 function t(...)，避免在非 module script 變成 window.t 造成遞迴
const tr = (key, fallback) => {
  const fn = window.t;
  return (typeof fn === 'function') ? fn(key, fallback) : (fallback ?? key);
};

// === 設定：可在外部先塞 window.NATION_MAP_CONFIG 覆蓋 ===
window.NATION_MAP_CONFIG = window.NATION_MAP_CONFIG || {};
const MAP_CFG = window.NATION_MAP_CONFIG;

// 其他地區顯示上限（可設 Infinity）
const REGION_LIST_MAX = Number.isFinite(MAP_CFG.regionListMax) ? MAP_CFG.regionListMax : 60;

// 滾動目標（整合頁面 .world_map； demo 沒有 fallback）
const SCROLL_TARGET_SELECTOR = MAP_CFG.scrollTargetSelector || '.world_map';
const SCROLL_DURATION = Number.isFinite(MAP_CFG.scrollDuration) ? MAP_CFG.scrollDuration : 800;

function animateScrollTo(targetY, duration = 800) {
  const startY = window.scrollY || document.documentElement.scrollTop || 0;
  const diff = targetY - startY;
  const startT = performance.now();

  const easeInOutCubic = (x) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  function step(now) {
    const t01 = Math.min(1, (now - startT) / duration);
    const eased = easeInOutCubic(t01);
    window.scrollTo(0, startY + diff * eased);
    if (t01 < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


// === [01] 滾動導引（點擊底部國旗 / service_map 入口時，平滑捲到地圖區） ===
// 功能：把使用者視線帶回地圖區，避免點了入口卻不知道地圖在哪裡。
// 刪除影響：功能不會壞，但 UX 會變差（點了入口沒有明顯回饋）。
// ------------------------------------------------------------
function scrollToWorldMap() {
  const target =
    document.querySelector(SCROLL_TARGET_SELECTOR) ||
    document.getElementById('mapFrame') ||
    document.getElementById('mapSvg');

  if (!target) return;

  const top = target.getBoundingClientRect().top + (window.scrollY || 0);
  animateScrollTo(top, SCROLL_DURATION);
}

function bindServiceMapScroll() {
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('#service_map') : null;
    if (!a) return;
    e.preventDefault();
    scrollToWorldMap();
  });
}



// === [02] MapViewer：地圖互動核心（載入 / transform / 手勢 / 點擊） ===
// 功能：管理 SVG 在 viewport 中的縮放與平移，並把點擊事件導向 showInfo。
// 刪除影響：地圖會變成靜態圖，或只剩顯示但無法操作。
// ------------------------------------------------------------
class MapViewer {
  constructor(svg, viewport, infoPanel) {
    this.svg       = svg;
    this.viewport  = viewport;
    this.infoPanel = infoPanel;

    // 加：記住外層 mapFrame
    this.frameEl = svg.parentElement;  // #mapFrame
    this.frameW = FRAME_W;
    this.frameH = FRAME_H;
    this.updateFrameSize();
    this.contentW = 1000;
    this.contentH = 500;

    this.baseScale  = 1;
    this.scale      = 1;
    this.zoomFactor = 1;

    this.tx = 0;
    this.ty = 0;

    this.isPanning     = false;
    this.panStart      = { x: 0, y: 0 };
    this.startTxTy     = { tx: 0, ty: 0 };
    this.pointerMap    = new Map();         // pointerId
    this.lastPinchDist = null;
    this.lastCenter    = null;

    this.activeEl = null;  // 目前高亮的元素

    this.defaultTouchAction = window.getComputedStyle(this.svg).touchAction || 'auto';

    this.bindEvents();
  }

  isMobileLike() {
    return (
      window.matchMedia('(max-width: 899px)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0
    );
  }

  isMobileTouch(e) {
    return e.pointerType === 'touch' && this.isMobileLike();
  }

  setTouchAction(action) {
    if (this.svg && this.svg.style.touchAction !== action) {
      this.svg.style.touchAction = action;
    }
  }

  updateFrameSize() {
    if (!this.frameEl) return;
    const rect = this.frameEl.getBoundingClientRect();
    this.frameW = rect.width  || FRAME_W;
    this.frameH = rect.height || FRAME_H;
    // 同步回全域（給還沒 refactor 完的地方用）
    FRAME_W = this.frameW;
    FRAME_H = this.frameH;
  }

  bindEvents() {
    this.svg.addEventListener('wheel', (e) => { e.preventDefault(); this.onWheel(e); }, { passive: false });
    this.svg.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup',   (e) => this.onPointerUp(e));

      // 事件委派在 viewport 上；另外也在 svg 上做一次保險
    this.viewport.addEventListener('click', (e) => this.onRegionClick(e));
    //this.svg.addEventListener('click', (e) => this.onRegionClick(e));
  }

  async load(fileName) {
    const url = MAP_BASE + fileName;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`載入失敗：${url}`);

    const txt    = await res.text();
    const doc    = new DOMParser().parseFromString(txt, 'image/svg+xml');
    const srcSvg = doc.documentElement;

      // 依 viewBox 推得原始尺寸
    if (srcSvg && srcSvg.viewBox && srcSvg.viewBox.baseVal) {
      this.contentW = srcSvg.viewBox.baseVal.width || parseFloat(srcSvg.getAttribute('width')) || FRAME_W;
      this.contentH = srcSvg.viewBox.baseVal.height || parseFloat(srcSvg.getAttribute('height')) || FRAME_H;
    } else {
      const wAttr         = parseFloat(srcSvg.getAttribute('width'));
      const hAttr         = parseFloat(srcSvg.getAttribute('height'));
            this.contentW = Number.isFinite(wAttr) ? wAttr : FRAME_W;
            this.contentH = Number.isFinite(hAttr) ? hAttr : FRAME_H;
    }

    this.viewport.innerHTML = '';
    const defs = srcSvg.querySelector('defs');
    if (defs) this.viewport.appendChild(document.importNode(defs, true));

    Array.from(srcSvg.childNodes).forEach((node) => {
      if (node.nodeType === 1 && node.tagName.toLowerCase() === 'defs') return;
      this.viewport.appendChild(document.importNode(node, true));
    });

    // 可互動圖形加上指標/點擊能力
    this.viewport.querySelectorAll('path, polygon, polyline, rect, circle').forEach(el => {
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
    });

    this.fitToContain();
    this.render();
  }

  fitToContain() {
    this.updateFrameSize();
    const sx = this.frameW / this.contentW;
    const sy = this.frameH / this.contentH;
      // 高度為基準，上下貼齊邊界
    this.baseScale = sy;

    this.zoomFactor = 1;
    this.scale      = this.baseScale * this.zoomFactor;

    const sw = this.contentW * this.scale;
    const sh = this.contentH * this.scale;

    this.tx = (this.frameW - sw) / 2;
    this.ty = (this.frameH - sh) / 2;
  }

  onWheel(e) {
    e.preventDefault();

    const delta  = Math.sign(e.deltaY) * -1;
    const factor = 1 + delta * ZOOM_STEP;

    const { x: mx, y: my } = this.toLocal(e);
    this.zoomBy(factor, mx, my);
  }

  zoomBy(factor, centerX = this.frameW / 2, centerY = this.frameH / 2) {
    const base    = this.baseScale;
    let   newZoom = (this.scale * factor) / base;
          newZoom = this.clamp(newZoom, MIN_ZOOM, MAX_ZOOM);

    const newScale = base * newZoom;
    const k        = newScale / this.scale;

      // 以指定中心點縮放
    this.tx = centerX - (centerX - this.tx) * k;
    this.ty = centerY - (centerY - this.ty) * k;

    this.scale      = newScale;
    this.zoomFactor = newZoom;

    this.clampTranslation();
    this.render();
  }

  onPointerDown(e) {
      // 只在地圖框內處理
    if (e.target.closest('#infoPanel')) return;

    this.pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const isTouchMobile = this.isMobileTouch(e);
    const allowSinglePan = !isTouchMobile;

    if (isTouchMobile && this.pointerMap.size < 2) {
      this.isPanning     = false;
      this.lastPinchDist = null;
      this.lastCenter    = null;
      this.setTouchAction('pan-y pinch-zoom');
      return;
    }

    if (isTouchMobile && this.pointerMap.size === 2) {
      this.setTouchAction('none');
    }

    if (this.pointerMap.size === 1 && allowSinglePan) {
        // 一指：啟動平移（僅桌機 / 非觸控）
      this.isPanning     = true;
      this.panStart      = { x: e.clientX, y: e.clientY };
      this.startTxTy     = { tx: this.tx, ty: this.ty };
      this.lastPinchDist = null;
      this.lastCenter    = null;
    } else if (this.pointerMap.size === 2) {
        // 兩指：切換成 pinch 模式，不再平移
            this.isPanning     = false;
      const pts                = Array.from(this.pointerMap.values());
            this.lastPinchDist = Math.hypot(
        pts[0].x - pts[1].x,
        pts[0].y - pts[1].y
      );
      this.lastCenter    = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
      };
    }
  }

  onPointerMove(e) {
    if (!this.pointerMap.has(e.pointerId)) return;

    this.pointerMap.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.isMobileTouch(e) && this.pointerMap.size < 2) {
      return; // 手機觸控需要雙指才啟動手勢
    }

      // 兩指 pinch：距離變化當縮放
    if (this.pointerMap.size === 2 && this.lastPinchDist != null) {
      const pts  = Array.from(this.pointerMap.values());
      const dist = Math.hypot(
        pts[0].x - pts[1].x,
        pts[0].y - pts[1].y
      );
      if (dist <= 0) return;

      const factor             = dist / this.lastPinchDist;
            this.lastPinchDist = dist;

      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      if (this.lastCenter) {
        const dx = cx - this.lastCenter.x;
        const dy = cy - this.lastCenter.y;
        this.tx += dx;
        this.ty += dy;
      }
      this.lastCenter = { x: cx, y: cy };
      const { x: lx, y: ly } = this.toLocal({ clientX: cx, clientY: cy });
      this.zoomBy(factor, lx, ly);
      return;
    }

      // 一指平移
    if (this.isPanning) {
      const dx      = e.clientX - this.panStart.x;
      const dy      = e.clientY - this.panStart.y;
            this.tx = this.startTxTy.tx + dx;
            this.ty = this.startTxTy.ty + dy;
      this.clampTranslation();
      this.render();
    }
  }

  onPointerUp(e) {
    this.pointerMap.delete(e.pointerId);

    if (this.pointerMap.size < 2) {
      this.lastPinchDist = null;
      this.lastCenter    = null;
    }
    if (this.pointerMap.size === 0) {
      this.isPanning = false;
      if (this.isMobileTouch(e)) {
        this.setTouchAction(this.defaultTouchAction);
      } 
      return;
    }

      // 兩指回一指：重新啟動平移
    if (this.pointerMap.size === 1 && !this.isMobileTouch(e)) {
      const pt             = Array.from(this.pointerMap.values())[0];
            this.isPanning = true;
            this.panStart  = { x: pt.x, y: pt.y };
            this.startTxTy = { tx: this.tx, ty: this.ty };
    }

    if (this.isMobileTouch(e) && this.pointerMap.size < 2) {
      this.setTouchAction(this.defaultTouchAction);
    }
  }


  onRegionClick(e) {
    const target = (e.target && e.target.closest) ? e.target.closest('path, polygon, polyline, rect, circle') : null;
    if (!target || !this.viewport.contains(target)) {
      // 空白區域點擊：清除選取
      if (this.activeEl) {
        this.activeEl.classList.remove('active-region');
        this.activeEl = null;
      }
      // 移除聚焦模式類別
      this.frameEl.classList.remove('focus-mode');
      // 關閉資訊面板
      this.infoPanel.classList.remove('open');
      return;
    }
    if (!target || !this.viewport.contains(target)) return;

    if (this.activeEl && this.activeEl !== target) this.activeEl.classList.remove('active-region');
    this.activeEl = target;
    this.activeEl.classList.add('active-region');

    const name = this.extractRegionName(target);
    const iso2 = this.findIso2(target);
    const box  = target.getBBox ? target.getBBox() : { x: 0, y: 0, width: 0, height: 0 };

    this.showInfo({ name, iso2, bbox: box });
  }


  extractRegionName(el) {
    const dataName = el.getAttribute('data-name');
    if (dataName) return dataName;

      // 支援 attribute 形式的 title
    const titleAttr = el.getAttribute('title');
    if (titleAttr) return titleAttr;

    const titleEl = el.querySelector ? el.querySelector('title') : null;
    if (titleEl && titleEl.textContent) return titleEl.textContent.trim();

    const aria = el.getAttribute('aria-label');
    if (aria) return aria;

    const id = el.id || el.getAttribute('id');
    if (id) return id;

    let p = el.parentNode;
    while (p && p !== this.viewport && p.nodeType === 1) {
      const dn = p.getAttribute('data-name');
      if (dn) return dn;
      const pid = p.id || p.getAttribute('id');
      if (pid) return pid;
      p = p.parentNode;
    }
    return '未命名地區';
  }

  findIso2(el) {
    // 往上找最近的兩碼 ID；例如 UM-MQ 這種取前綴 UM
  let p = el;
  while (p && p !== this.viewport && p.nodeType === 1) {
    const id = (p.id || p.getAttribute && p.getAttribute('id') || '').toString();
    if (id) {
      const m = id.match(/^[A-Za-z]{2}(?:-[A-Za-z]{2})?$/);
      if (m) return id.split('-')[0].toUpperCase();
    }
    p = p.parentNode;
   }
   return null;
  }

    zoomToBBox(bbox, { pad = 1.1, screenX, screenY, animMs = 250 } = {}) {
    this.updateFrameSize();
    const fw = this.frameW;
    const fh = this.frameH;

    const targetW = (fw * 0.5) / pad;
    const targetH = (fh * 0.75) / pad;

    const sx = targetW / (bbox.width || 1);
    const sy = targetH / (bbox.height || 1);

    const zoomFactorTarget = this.clamp((Math.min(sx, sy) / this.baseScale), MIN_ZOOM, MAX_ZOOM);
    const scaleTarget      = this.baseScale * zoomFactorTarget;

    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;

    let txTarget = (screenX ?? fw / 2) - cx * scaleTarget;
    let tyTarget = (screenY ?? fh / 2) - cy * scaleTarget;

      // 邊界修正
    ({ tx: txTarget, ty: tyTarget } = this.clampTxTy({
      scale: scaleTarget,
      tx   : txTarget,
      ty   : tyTarget
    }));

      // 動畫補間
    const s0   = this.scale,  sx0 = this.tx,  sy0 = this.ty;
    const s1   = scaleTarget, sx1 = txTarget, sy1 = tyTarget;
    const t0   = performance.now();
    const ease = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;  // quad in-out

    const step = () => {
      const p               = Math.min(1, (performance.now() - t0) / animMs);
      const e               = ease(p);
            this.scale      = s0 + (s1 - s0) * e;
            this.tx         = sx0 + (sx1 - sx0) * e;
            this.ty         = sy0 + (sy1 - sy0) * e;
            this.zoomFactor = this.scale / this.baseScale;
      this.render();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }


  clampTxTy({ scale = this.scale, tx = this.tx, ty = this.ty }) {
    this.updateFrameSize();
    const sw    = this.contentW * scale;
    const sh    = this.contentH * scale;
    let   outTx = tx, outTy = ty;

    const fitsX = sw <= this.frameW;
    const fitsY = sh <= this.frameH;

    if (fitsX) outTx = (this.frameW - sw) / 2; else outTx = this.clamp(tx, this.frameW - sw, 0);
    if (fitsY) outTy = (this.frameH - sh) / 2; else outTy = this.clamp(ty, this.frameH - sh, 0);

    return { tx: outTx, ty: outTy };
  }

  resetView() {
    this.fitToContain();
    this.render();
  }

  render() {
    this.viewport.setAttribute(
      'transform',
      `translate(${this.tx},${this.ty}) scale(${this.scale})`
    );
  }

  clampTranslation() {
    const r       = this.clampTxTy({});
          this.tx = r.tx; this.ty = r.ty;
  }

  toLocal(e) {
    const rect = this.svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  setDockSide(side) {
      // side: 'left' 或 'right'
    const panel = this.infoPanel;
    const frame = this.frameEl;

    if (side === 'right') {
      panel.classList.add('right');
      frame.classList.add('dock-right');
    } else {
      panel.classList.remove('right');
      frame.classList.remove('dock-right');
    }
  }

  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  escapeHtml(s) { return String(s).replace(/[&<>"']/g, (ch) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'': '&#39;' }[ch])); }
}

// === 其他地區（#regionGrid）動態按鈕 ===
function buildIso2ToEnglishNameMap() {
  const map = new Map();
  const src = window.COUNTRY_INFO || {};
  for (const enName of Object.keys(src)) {
    const iso2 = (src[enName] && src[enName].iso2) ? String(src[enName].iso2).toUpperCase() : '';
    if (iso2 && !map.has(iso2)) map.set(iso2, enName);
  }
  return map;
}


// === [03] 地圖下方：其他地區（regionGrid） ===
// 功能：用 country-payments.js 的「物件定義順序」當作顯示順序；並只顯示 map-flag-Places === true 的國家。
// 刪除影響：地圖仍可點擊，但使用者少了「國旗入口」，小島/難點的國家會很難找到。
// ------------------------------------------------------------
function renderRegionGrid(viewer){
  const grid = document.getElementById('regionGrid');
  if (!grid) return;

  const payments = window.COUNTRY_PAYMENTS || {};
  const iso2sDefinedOrder = Object.keys(payments); // 依 country-payments 定義順序（插入順序）
  const iso2ToEnName = buildIso2ToEnglishNameMap(); // iso2 -> English name key for COUNTRY_INFO

  // 只取需要顯示的（map-flag-Places: true），並且套用上限
  let list = iso2sDefinedOrder
    .filter(iso2 => !!iso2)
    .filter(iso2 => !!(payments[iso2] && payments[iso2]['map-flag-Places'] === true));

  if (Number.isFinite(REGION_LIST_MAX)) {
    list = list.slice(0, REGION_LIST_MAX);
  }

  grid.innerHTML = '';

  list.forEach((iso2) => {
    const enName = (iso2ToEnName.get(iso2) || iso2);

    const info = (window.getCountryInfo ? window.getCountryInfo(enName) : null);
    const zhName = (info && info.zhName) ? info.zhName : enName;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'region-btn';
    btn.dataset.iso2 = iso2;
    // 保留接口：以後語系切換用
    btn.dataset.nameEn = enName;
    btn.dataset.nameZh = zhName;

    const flagWrap = document.createElement('span');
    flagWrap.className = 'region-flag';
    const flagImg = document.createElement('img');
    flagImg.alt = `${zhName}${tr('ui.flagSuffix', ' 國旗')}`;
    flagWrap.appendChild(flagImg);

    const nameWrap = document.createElement('span');
    nameWrap.className = 'region-name';
    // 不顯示英文，但保留在 dataset（上面已塞）
    nameWrap.innerHTML = `<span class="zh">${zhName}</span>`;

    btn.appendChild(flagWrap);
    btn.appendChild(nameWrap);

    // 現有的旗幟載入規則（webp→png→jpg）
    if (typeof setFlagByIso2 === 'function') {
      setFlagByIso2(flagImg, iso2);
    }

    btn.addEventListener('click', () => {
      const el =
        (viewer && viewer.viewport && viewer.viewport.querySelector(`#${iso2}`)) ||
        (viewer && viewer.viewport && viewer.viewport.querySelector(`[id^="${iso2}-"]`));

      let bbox;
      let name;

      if (el && el.getBBox) {
        bbox = el.getBBox();
        name = viewer.extractRegionName(el);
      } else {
        bbox = { x: viewer.contentW * 0.5, y: viewer.contentH * 0.5, width: 1, height: 1 };
        name = enName;
      }

      if (viewer.activeEl && viewer.activeEl !== el) {
        viewer.activeEl.classList.remove('active-region');
      }
      viewer.activeEl = el || null;
      if (el) el.classList.add('active-region');

      viewer.showInfo({ name, iso2, bbox });

      // 點底下國旗後滾動到地圖區塊（整合頁面吃 .world_map）
      scrollToWorldMap();
    });

    grid.appendChild(btn);
  });
}

  // === 啟動 ===
(async function init() {
  const svg        = document.getElementById('mapSvg');
  const viewport   = document.getElementById('viewport');
  const infoPanel  = document.getElementById('infoPanel');
  const closeInfo  = document.getElementById('closeInfo');
  const btnZoomIn  = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnReset   = document.getElementById('btnResetView');
  const mapHint    = document.getElementById('mapHint');

  const viewer = new MapViewer(svg, viewport, infoPanel);
  bindServiceMapScroll();

  const updateHintText = () => {
    if (!mapHint) return;
    const isMobile = viewer.isMobileLike();
    mapHint.textContent = isMobile
      ? '雙指拖曳或縮放地圖；點擊地區查看資訊'
      : '滾輪縮放、拖曳平移；點擊地區查看資訊';
  };
  updateHintText();

    // 更新外框大小＋重新限制邊界，
    // 不重置縮放與中心
  window.addEventListener('resize', () => {
    viewer.updateFrameSize();
    viewer.clampTranslation();
    viewer.render();
    updateHintText();
  });

  closeInfo.addEventListener('click', () => {
    infoPanel.classList.remove('open');
    hideMethodTooltip();
  });
  const mapFrame = document.getElementById('mapFrame');

    // 手機版：點擊地圖空白處關閉資訊卡
  mapFrame.addEventListener('click', (e) => {
    const isMobileLike = window.matchMedia('(max-width: 899px)').matches;
    if (!isMobileLike) return;

      // 點到區域 path / svg 不關閉（那些會觸發 showInfo）
    const target = e.target;
    if (target.closest && target.closest('#infoPanel')) return;
    if (target.closest && target.closest('path, polygon, polyline, rect, circle')) return;

    infoPanel.classList.remove('open');
    hideMethodTooltip();
  });

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      viewer.zoomBy(1.25);  // 放大一點
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      viewer.zoomBy(1 / 1.25);  // 縮小一點
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      // 視角重置
      viewer.resetView();

      // 面板收起
      infoPanel.classList.remove('open');

      // 地圖高亮取消
      if (viewer.activeEl) {
        viewer.activeEl.classList.remove('active-region');
        viewer.activeEl = null;
      }

      // tooltip 關掉
      hideMethodTooltip();
    });
  }

  try {
    await viewer.load('world.svg');

    // 先渲染下方「其他地區」按鈕
    renderRegionGrid(viewer);

      // 1) 嘗試用 ISO2 = TW 找到台灣 path
    const viewportEl = document.getElementById('viewport');
    let   tw         = viewportEl.querySelector('#TW') ||
             viewportEl.querySelector('[id^="TW-"]') ||
             viewportEl.querySelector('[data-name="Taiwan"]');

    if (tw && tw.getBBox) {
      const bbox = tw.getBBox();
      const name = viewer.extractRegionName(tw);
      const iso2 = viewer.findIso2(tw);

      if (viewer.activeEl && viewer.activeEl !== tw) {
        viewer.activeEl.classList.remove('active-region');
      }
      viewer.activeEl = tw;
      tw.classList.add('active-region');

      viewer.showInfo({ name, iso2, bbox });  // 初始狀態就顯示台灣資訊
    }
  } catch (err) {
    console.error(err);
  }
})();


  // 旗幟來源嘗試：Exact / _ / - ；svg→png 退回
function flagCandidates(en){
  const base     = './assest/national-flag/';
  const variants = [
    en, en.replace(/\s+/g,'_'), en.replace(/\s+/g,'-')
  ];
  const exts = ['.svg', '.png', '.jpg'];
  const list = [];
  variants.forEach(v => exts.forEach(ext => list.push(base + encodeURIComponent(v + ext))));
  return list;
}
function setFlag(imgEl, en){
  const tries         = flagCandidates(en);
  let   i             = 0;
  const next          = ()=> { if (i >= tries.length) { imgEl.removeAttribute('src'); imgEl.alt = 'No flag'; return; } imgEl.src = tries[i++]; };
        imgEl.onerror = next;
  next();
}

  // === 國旗載入：依「國名簡寫檔案」 ===
  // 旗幟放在 /assest/national-flag/，檔名為 ISO2：US.webp、TW.webp、JP.webp...
const FLAG_BASE = './assest/national-flag/';
function setFlagByIso2(imgEl, iso2){
  const codeList = [String(iso2||'').toUpperCase(), String(iso2||'').toLowerCase()].filter(Boolean);
  const exts     = ['.webp', '.svg', '.png', '.jpg'];
  const tries    = [];
  codeList.forEach(c => exts.forEach(ext => tries.push(FLAG_BASE + c + ext)));
  let   i             = 0;
  const next          = ()=>{ if (i >= tries.length) { imgEl.removeAttribute('src'); imgEl.alt = 'No flag'; return; } imgEl.src = tries[i++]; };
        imgEl.onerror = next;
  next();
}


  // 英文標準國名（對應 world.svg 的 title）→ ISO 3166-1 alpha-2 碼
const ISO2_BY_NAME = {
  "Taiwan"              : "TW",
  "Japan"               : "JP",
  "United States"       : "US",
  "United Kingdom"      : "GB",
  "Korea, Republic of"  : "KR",
  "Singapore"           : "SG",
  "Hong Kong"           : "HK",
  "Australia"           : "AU",
  "Canada"              : "CA",
  "Germany"             : "DE",
  "France"              : "FR",
  "Italy"               : "IT",
  "Spain"               : "ES",
  "Netherlands"         : "NL",
  "Sweden"              : "SE",
  "Norway"              : "NO",
  "Denmark"             : "DK",
  "Finland"             : "FI",
  "Poland"              : "PL",
  "Czechia"             : "CZ",
  "Austria"             : "AT",
  "Switzerland"         : "CH",
  "Belgium"             : "BE",
  "Ireland"             : "IE",
  "New Zealand"         : "NZ",
  "Thailand"            : "TH",
  "Malaysia"            : "MY",
  "Philippines"         : "PH",
  "Indonesia"           : "ID",
  "Viet Nam"            : "VN",
  "India"               : "IN",
  "United Arab Emirates": "AE",
  "Turkey"              : "TR",
  "Brazil"              : "BR",
  "Mexico"              : "MX",
  "Argentina"           : "AR",
  "South Africa"        : "ZA"
};


  // 若 `country-info.js` 也想放 iso2，可在該檔加上 {iso2:"TW"}；下方會優先讀它
function getIso2ByName(enName){
  if (window.COUNTRY_INFO && window.COUNTRY_INFO[enName] && window.COUNTRY_INFO[enName].iso2) {
    return window.COUNTRY_INFO[enName].iso2.toUpperCase();
  }
  return ISO2_BY_NAME[enName] || null;
}

function flagCandidatesByIso2(iso2){
  if (!iso2) return [];
  const codes = [iso2.toUpperCase(), iso2.toLowerCase()];
  const exts  = ['.webp', '.svg', '.png', '.jpg'];
  const list  = [];
  codes.forEach(c => exts.forEach(ext => list.push(FLAG_BASE + c + ext)));
  return list;
}
function setFlagByName(imgEl, enName){
  // 說明：以「英文國名」→ ISO2 → 國旗檔名候選；目前未被呼叫（主流程走 setFlagByIso2）。
  // 刪除影響：不影響現行點擊流程；但在資料只有國名、沒有 ISO2 的情境會少一層容錯。
    // 1) 依 iso2 簡寫檔名
  const iso2  = getIso2ByName(enName);
  let   tries = flagCandidatesByIso2(iso2);

    // 2) 後援：國名直接當檔名（空白→底線/連字號/原樣），避免少數例外
  const variants = [enName, enName.replace(/\s+/g,'_'), enName.replace(/\s+/g,'-')];
  const exts     = ['.webp','.svg','.png','.jpg'];
  variants.forEach(v => exts.forEach(ext => tries.push(FLAG_BASE + encodeURIComponent(v + ext))));

  let   i    = 0;
  const next = ()=> {
    if (i >= tries.length) { imgEl.removeAttribute('src'); imgEl.alt = tr('ui.noFlag', '無國旗'); return; }
    imgEl.src = tries[i++];
  };
  imgEl.onerror = next;
  next();
}


  // 點擊事件
MapViewer.prototype.showInfo = function ({ name, iso2, bbox }) {
  const info = (window.getCountryInfo ? getCountryInfo(name) : null)
               || { zhName: name, currencyCode: '—', currencyName: '—', iso2 };

  const infoBody = document.getElementById('infoBody');
  const zh       = this.escapeHtml(info.zhName || name);
  const en       = this.escapeHtml(name);
  const curZh    = this.escapeHtml(info.currencyName || '—');
  const curEn    = this.escapeHtml(info.currencyCode || '—');

  infoBody.innerHTML = `
  <div class="info-top">
    <section class="card name-card card--naked">
      <h2 class="zh-title">${zh}</h2>
    </section>

    <section class="card meta-card card--naked">
      <div class="flag-box"><img id="flagImg" alt="${zh}${tr('ui.flagSuffix',' 國旗')}" /></div>
      <div class="currency-box">
        <div class="zh-cur">${curZh}</div>
      </div>
    </section>
  </div>

  <section class="card payments-card" id="paymentsCard">
    <div class="payments-scroll" id="paymentsScroll"></div>
    <div class="pay-dots" id="payDots" aria-hidden="true"></div>
  </section>
  `;

  // 保留接口（給未來語系切換 / debug 用，不顯示）
  infoBody.dataset.nameEn = en;
  infoBody.dataset.currencyCode = curEn;

    // 判斷是否為手機／小平板畫面
  const isMobileLike = window.matchMedia('(max-width: 899px)').matches;

    // === 右上角模式滑桿（桌機／平板用；手機版不顯示） ===
  const header = document.querySelector('#infoPanel .info-header');
  if (!isMobileLike && header) {
    const old = header.querySelector('.mode-toggle');
    if (old) old.remove();

    const toggle           = document.createElement('div');
          toggle.className = 'mode-toggle';
          toggle.innerHTML = `
      <div class = "knob"></div>
      <div class = "opt opt-full">清單</div>
      <div class = "opt opt-icon">圖標</div>
    `;

      // 正確插在 controls 區塊前面，而不是 closeInfo 本身
    const controls = header.querySelector('.info-controls');
    if (controls) {
      header.insertBefore(toggle, controls);
    } else {
      header.appendChild(toggle);
    }

      // 沿用上次模式（記在 infoBody data-paymode）
    const mode          = infoBody.getAttribute('data-paymode') || 'full';
    const paymentsMount = document.getElementById('paymentsCard');
    if (mode === 'icon') {
      toggle.classList.add('is-icon');
      paymentsMount.classList.add('icon-only');
    }
    toggle.querySelector('.opt-full').classList.toggle('active', mode === 'full');
    toggle.querySelector('.opt-icon').classList.toggle('active', mode === 'icon');

    toggle.addEventListener('click', () => {
      const isIcon = toggle.classList.toggle('is-icon');
      paymentsMount.classList.toggle('icon-only', isIcon);
      infoBody.setAttribute('data-paymode', isIcon ? 'icon' : 'full');
      toggle.querySelector('.opt-full').classList.toggle('active', !isIcon);
      toggle.querySelector('.opt-icon').classList.toggle('active',  isIcon);
      hideMethodTooltip();
    });
  }

    // 以 iso2 載國旗（例如 UM-xxx 只取 UM）
  const flagImg = document.getElementById('flagImg');
  const code    = (iso2 || (info && info.iso2) || '').toString().split('-')[0];
  setFlagByIso2(flagImg, code);

    // 渲染支援付款方式
  const paymentsMount = document.getElementById('paymentsCard');

  if (isMobileLike) {
      // 手機版：固定 icon-only 模式
    paymentsMount.classList.add('icon-only');
    infoBody.setAttribute('data-paymode', 'icon');
  }

  renderPayments(code, paymentsMount);

    // === 依裝置類型決定資訊卡位置與對焦方式 ===
  this.updateFrameSize();
  const fw = this.frameW;
  const fh = this.frameH;

  if (isMobileLike) {
    this.infoPanel.classList.remove('right');
    this.infoPanel.classList.add('open');
    if (this.frameEl) {
      this.frameEl.classList.remove('dock-right');
    }

    const screenX = fw * 0.5;
    const screenY = fh * 0.32;  // 地圖中心略偏上

    this.zoomToBBox(bbox, {
      pad: 1.2,
      screenX,
      screenY,
      animMs: 280
    });
  } else {
      // 桌機／平板：偏左就把卡片放右邊，反之放左
    const cxRatio   = (bbox.x + bbox.width / 2) / this.contentW;
    const dockRight = cxRatio < 0.38;                             // 偏左 → 卡片靠右

    this.infoPanel.classList.toggle('right', dockRight);
    this.infoPanel.classList.add('open');

    if (this.frameEl) {
      this.frameEl.classList.toggle('dock-right', dockRight);
    }

    this.updateFrameSize();
    const pw      = this.infoPanel.getBoundingClientRect().width || fw * 0.22;
    const screenX = dockRight
      ? (fw - pw) * 0.38
      :  pw + (fw - pw) * 0.62;

    this.zoomToBBox(bbox, {
      pad: 1.2,
      screenX,
      screenY: fh * 0.5,
      animMs : 280
    });
  }
};


  // === Icon 模式用的金流名稱 tooltip ===
const methodTooltipEl    = document.getElementById('methodTooltip');
let   methodTooltipTimer = null;

function hideMethodTooltip() {
  if (!methodTooltipEl) return;
  methodTooltipEl.classList.remove('visible');
  methodTooltipEl.textContent = '';
  methodTooltipTimer          = null;
}

function attachMethodTooltip(chip, meta) {
  if (!methodTooltipEl) return;

  const label = tr(`pay.method.${meta.id}`, meta.name_zh || '');
  if (!label) return;

  let hovering = false;

    // 共用：實際顯示 tooltip 的函式（給 hover 和長按共用）
  const showAt = (clientX, clientY) => {
    const card = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    const img                       = chip.querySelector('img');
          methodTooltipEl.innerHTML = '';

    if (img) {
      const iconClone = img.cloneNode(true);
      methodTooltipEl.appendChild(iconClone);
    }

    const span             = document.createElement('span');
          span.textContent = label;
    methodTooltipEl.appendChild(span);

    methodTooltipEl.style.left = clientX + 'px';
    methodTooltipEl.style.top  = (clientY - 16) + 'px';
    methodTooltipEl.classList.add('visible');
  };

    // 滑鼠 hover（桌機）
  chip.addEventListener('mouseenter', (e) => {
          hovering = true;
    const card     = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    const startEvent = e;
    methodTooltipTimer && clearTimeout(methodTooltipTimer);
    methodTooltipTimer = setTimeout(() => {
      if (!hovering) return;
      showAt(startEvent.clientX, startEvent.clientY);
    }, 500);
  });

  chip.addEventListener('mousemove', (e) => {
    if (!methodTooltipEl.classList.contains('visible')) return;
    methodTooltipEl.style.left = e.clientX + 'px';
    methodTooltipEl.style.top  = (e.clientY - 16) + 'px';
  });

  chip.addEventListener('mouseleave', () => {
    hovering = false;
    if (methodTooltipTimer) {
      clearTimeout(methodTooltipTimer);
      methodTooltipTimer = null;
    }
    hideMethodTooltip();
  });

    // 手機／觸控：長按顯示 tooltip，放開就消失
  let pressTimer = null;

  chip.addEventListener('pointerdown', (e) => {
    const card = chip.closest('.payments-card');
    if (!card || !card.classList.contains('icon-only')) return;

    pressTimer && clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      showAt(e.clientX, e.clientY);
    }, 500);  // 長按 0.5 秒
  });

  const clearPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    hideMethodTooltip();
  };

  chip.addEventListener('pointerup', clearPress);
  chip.addEventListener('pointercancel', clearPress);
  chip.addEventListener('pointerleave', clearPress);
}



function renderPayments(iso2, mountEl){
  // mountEl = #paymentsCard（外框，不應水平滾動）
  // 真正水平滾動的容器使用 .payments-scroll
  const scrollEl = mountEl.querySelector('.payments-scroll') || mountEl;
  const dotsHost = mountEl.querySelector('.pay-dots');

  // 清掉舊的 dots / scroll 事件
  if (mountEl.__payScrollHandler && scrollEl) {
    scrollEl.removeEventListener('scroll', mountEl.__payScrollHandler);
    mountEl.__payScrollHandler = null;
  }
  if (dotsHost) dotsHost.innerHTML = '';

  const data = (window.getCountryPayments ? getCountryPayments(iso2) : { methods: {} }).methods || {};
  const cats = (window.PAYMENT_CATEGORIES || []).slice();

  const content = document.createElement('div');
  const frag    = document.createDocumentFragment();

  const title = document.createElement('h3');
  title.className = 'sec-title';
  title.textContent = '支援付款方式';

  cats.forEach(cat => {
    const ids = data[cat.id] || [];
    if (!ids.length) return;

    const row           = document.createElement('div');
          row.className = 'cat-row';

      // 左側：專門放金流「大類 icon」的欄位
    const left              = document.createElement('div');
          left.className    = 'cat-icon-col';
    const catIcon = document.createElement('img');
    catIcon.className = 'cat-icon';
    catIcon.alt = cat.name_zh || cat.name_en || '';
    resolveIcon(catIcon, cat.icon || `./assest/payments/icons/${cat.id}`);
    left.appendChild(catIcon);
    row.appendChild(left);

      // 右側：大標題（中文 / 英文）＋底下支援的支付方式清單
    const right = document.createElement('div');

    const head = document.createElement('div');
    head.className = 'cat-head';
    const catTitle = document.createElement('div');
    catTitle.className = 'cat-title';
    catTitle.textContent = tr(`pay.category.${cat.id}`, cat.name_zh || '');
    // head 只放標題，icon 留在左欄
    head.appendChild(catTitle);

    const list           = document.createElement('div');
          list.className = 'method-list';

    const pool = (window.PAYMENT_METHODS && window.PAYMENT_METHODS[cat.id]) || [];
    const byId = new Map(pool.map(m => [m.id, m]));
    ids.forEach(id => {
      const m = byId.get(id);
      if (!m) return;

      const chip           = document.createElement('div');
            chip.className = 'method-chip';

      const mImg     = document.createElement('img');
            mImg.alt = m.name_en || m.name_zh;
      resolveIcon(mImg, m.icon || `./assest/payments/vendor/${m.id}`);

      const mText = document.createElement('div');
      mText.className = 'method-name';
      mText.innerHTML = `
        <span class="m-zh">${tr(`pay.method.${m.id}`, m.name_zh || '')}</span>
      `;
      chip.dataset.nameEn = m.name_en || '';

      chip.appendChild(mImg);
      chip.appendChild(mText);
      attachMethodTooltip(chip, m);
      list.appendChild(chip);
    });

    right.appendChild(head);
    right.appendChild(list);
    row.appendChild(right);
    frag.appendChild(row);
  });

  if (!frag.childNodes.length) {
    const empty             = document.createElement('div');
          empty.className   = 'kv';
          empty.textContent = '正在積極爭取此區域的付款方式!';
    frag.appendChild(empty);
  }

  content.appendChild(frag);
    // 更新 scroll 容器內的內容，dots 會留在外層
  scrollEl.innerHTML = '';
  scrollEl.appendChild(content);

      // === 手機／平板：建立卡片圓點與滑動邏輯 ===
  const isMobileLike = window.matchMedia('(max-width: 899px)').matches;
    // 舊的 title 清掉
  const oldTitle = mountEl.querySelector(':scope > .sec-title');
  if (oldTitle) oldTitle.remove();
  
  if (isMobileLike) {
      // 放在 payments-scroll 前面，避免 title 被當成橫向卡片的一份子
    mountEl.insertBefore(title, scrollEl);
  } else {
    mountEl.insertBefore(title, scrollEl);
  }
  if (isMobileLike) {
    const hasHorizontal = scrollEl.scrollWidth > scrollEl.clientWidth + 2;
    if (!hasHorizontal) return; // 直向捲動模式：不建立分頁圓點與橫滑事件

    const rows = Array.from(content.querySelectorAll('.cat-row'));
    if (rows.length > 1 && dotsHost) {
      rows.forEach((row, idx) => {
        const dot = document.createElement('button');
        if (idx === 0) dot.classList.add('is-active');
        dot.addEventListener('click', () => {
          const cardWidth = scrollEl.clientWidth || row.getBoundingClientRect().width;
          scrollEl.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
        });
        dotsHost.appendChild(dot);
      });

      const onScroll = () => {
        const cardWidth = scrollEl.clientWidth || 1;
        const index     = Math.round(scrollEl.scrollLeft / cardWidth);
        dotsHost.querySelectorAll('button').forEach((btn, i) => {
          btn.classList.toggle('is-active', i === index);
        });
      };
      mountEl.__payScrollHandler = onScroll;
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
    }
  }
}
