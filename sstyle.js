// KAENTA sstyle.js — 完全版

// =============================================
// 画像データ
// =============================================
var IMAGES = [
  {
    src: './assets/PC/product01.png', sp: './assets/SP/product01.jpeg',
    caption: '素材の表情を邪魔しない設計。仕立ての線、コバの輪郭、金具の静けさ。',
    name: 'Leather Bag A', material: 'コットン', sizes: 'S / M / L', url: ''
  },
  {
    src: './assets/PC/product02.png', sp: './assets/SP/product02.jpeg',
    caption: '使うほどに、持ち主の時間が宿るものへ。',
    name: 'Indigo Pouch', material: '藍染 × 革', sizes: 'F', url: ''
  },
  {
    src: './assets/PC/product03.png', sp: './assets/SP/product03.jpeg',
    caption: '藍は、深さのグラデーション。海の色は、毎日少しずつ違う。',
    name: 'Card Case', material: '革', sizes: 'F', url: ''
  },
  {
    src: './assets/PC/cafe01.png', sp: './assets/SP/cafe01.jpeg',
    caption: 'その揺らぎを、プロダクトの表情に。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/about-portrait.png', sp: './assets/SP/about-portrait.jpeg',
    caption: '余白のある暮らしに、静かな強さを。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/workshop01.png', sp: './assets/SP/workshop01.jpeg',
    caption: '体験は、記憶として残るデザイン。',
    name: 'Workshop Kit', material: '各種', sizes: 'F', url: ''
  },
  {
    src: './assets/PC/about-hero.png', sp: './assets/SP/about-hero.jpeg',
    caption: '手を動かす時間が、ものの価値を深くする。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/shop01.png', sp: './assets/SP/shop01.jpeg',
    caption: '「つくる」から始まる、あなたのKAENTA。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/about-work.png', sp: './assets/SP/about-work.jpeg',
    caption: '流行よりも、時間に耐えるかたち。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/hero-main.png', sp: './assets/SP/hero-main.jpeg',
    caption: '触れた瞬間にわかる、静かな上質。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/workshop02.png', sp: './assets/SP/workshop02.jpeg',
    caption: 'ほんの少しの「凛」と「余白」を、日常へ。',
    name: '', material: '', sizes: '', url: ''
  },
  {
    src: './assets/PC/shop02.png', sp: './assets/SP/shop02.jpeg',
    caption: '海の気配と、手仕事の温度。',
    name: '', material: '', sizes: '', url: ''
  },
];

// =============================================
// 状態変数
// =============================================
var current     = 0;
var total       = IMAGES.length;
var isAnimating = false;
var isSP        = false;
var spSlideW    = 0;
var lastWheel   = 0;

function idx(i) { return ((i % total) + total) % total; }

// =============================================
// DOM refs（load後に取得するものは関数内で取得）
// =============================================
var spTrack, spDots, spCaption;

// =============================================
// 入場アニメーション
// =============================================
function playEntrance() {
  gsap.set('#pcPrev',        { x: -60, opacity: 0 });
  gsap.set('#pcNext',        { x:  60, opacity: 0 });
  gsap.set('#pcMainImg',     { scale: 1.04, opacity: 0, filter: 'blur(6px)' });
  gsap.set('#galleryCaption',{ y: 16, opacity: 0 });
  gsap.set('#pcThumbs',      { y: 12, opacity: 0 });

  gsap.timeline({ delay: 0.1 })
    .to('#pcMainImg',     { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' })
    .to('#pcPrev',        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.2)
    .to('#pcNext',        { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, 0.2)
    .to('#galleryCaption',{ y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.5)
    .to('#pcThumbs',      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.6);
}

function playEntranceSP() {
  gsap.set('#spSlider', { opacity: 0, y: 20 });
  gsap.set('#spDots',   { opacity: 0 });
  gsap.set('#spCaption',{ opacity: 0, y: 8 });

  gsap.timeline({ delay: 0.2 })
    .to('#spSlider', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' })
    .to('#spCaption',{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4)
    .to('#spDots',   { opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.5);
}

// =============================================
// PC：ビルド・更新
// =============================================
function buildPC() {
  var pcThumbs = document.getElementById('pcThumbs');
  pcThumbs.innerHTML = '';
  IMAGES.forEach(function (img, i) {
    var el = document.createElement('div');
    el.className = 'pc-thumb' + (i === 0 ? ' is-active' : '');
    el.innerHTML = '<img src="' + img.src + '" alt="" loading="lazy">';
    el.addEventListener('click', function () { goTo(i); });
    pcThumbs.appendChild(el);
  });

  updatePC(false);
  setTimeout(playEntrance, 50);
}

function updatePC(animate) {
  var pcMainImg = document.getElementById('pcMainImg');
  var pcPrev    = document.getElementById('pcPrev');
  var pcNext    = document.getElementById('pcNext');
  var pcThumbs  = document.getElementById('pcThumbs');
  var captionText = document.getElementById('captionText');

  var p  = idx(current - 1);
  var n  = idx(current + 1);
  var pp = idx(current - 2);
  var nn = idx(current + 2);

  if (!animate) {
    pcMainImg.src = IMAGES[current].src;
  } else {
    pcMainImg.classList.add('is-changing');
    var newSrc = IMAGES[current].src;
    setTimeout(function () {
      pcMainImg.src = newSrc;
      pcMainImg.classList.remove('is-changing');
      isAnimating = false;
    }, 160);
  }

  // 左右サイド2枚ずつ
  pcPrev.innerHTML =
    '<div class="side-img" data-goto="' + pp + '"><img src="' + IMAGES[pp].src + '" alt="" loading="lazy"></div>' +
    '<div class="side-img" data-goto="' + p  + '"><img src="' + IMAGES[p].src  + '" alt="" loading="lazy"></div>';
  pcNext.innerHTML =
    '<div class="side-img" data-goto="' + n  + '"><img src="' + IMAGES[n].src  + '" alt="" loading="lazy"></div>' +
    '<div class="side-img" data-goto="' + nn + '"><img src="' + IMAGES[nn].src + '" alt="" loading="lazy"></div>';

  document.querySelectorAll('.side-img').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.onclick = function () { goTo(parseInt(el.dataset.goto)); };
  });

  pcThumbs.querySelectorAll('.pc-thumb').forEach(function (el, i) {
    el.classList.toggle('is-active', i === current);
  });

  captionText.textContent = IMAGES[current].caption;

  // TAP HINTはPC非表示
  updateTapHint();
}

// =============================================
// SP：ビルド・更新
// =============================================
function buildSP() {
  spTrack  = document.getElementById('spTrack');
  spDots   = document.getElementById('spDots');
  spCaption= document.getElementById('spCaption');

  spTrack.innerHTML = '';
  spDots.innerHTML  = '';

  // 両端にクローン追加: [last_clone][0][1]...[n-1][first_clone]
  var clonePrev = document.createElement('div');
  clonePrev.className = 'sp-slide sp-clone';
  clonePrev.innerHTML = '<img src="' + IMAGES[total - 1].sp + '" alt="">';
  spTrack.appendChild(clonePrev);

  IMAGES.forEach(function (img, i) {
    var slide = document.createElement('div');
    slide.className = 'sp-slide';
    slide.dataset.index = i;
    slide.innerHTML = '<img src="' + img.sp + '" alt="" loading="lazy">';
    spTrack.appendChild(slide);

    var dot = document.createElement('div');
    dot.className = 'sp-dot' + (i === 0 ? ' is-active' : '');
    spDots.appendChild(dot);
  });

  var cloneNext = document.createElement('div');
  cloneNext.className = 'sp-slide sp-clone';
  cloneNext.innerHTML = '<img src="' + IMAGES[0].sp + '" alt="">';
  spTrack.appendChild(cloneNext);

  spCaption.textContent = IMAGES[0].caption;
  layoutSP(false);
}

function layoutSP(withTransition) {
  var vw    = window.innerWidth;
  var mainW = vw * 0.78;
  var sideW = vw * 0.10;
  var gap   = vw * 0.025;
  spSlideW  = mainW + gap;

  spTrack.querySelectorAll('.sp-slide').forEach(function (slide) {
    slide.style.width       = mainW + 'px';
    slide.style.marginRight = gap + 'px';
  });

  var offset = sideW + gap - (current + 1) * spSlideW;
  spTrack.style.transition = withTransition === false ? 'none' : 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
  spTrack.style.transform  = 'translateX(' + offset + 'px)';

  updateSPClasses();
}

function updateSPClasses() {
  var realIdx = current + 1;
  spTrack.querySelectorAll('.sp-slide').forEach(function (slide, i) {
    slide.classList.toggle('is-main', i === realIdx);
    slide.classList.toggle('is-side', i !== realIdx);
  });
  spDots.querySelectorAll('.sp-dot').forEach(function (dot, i) {
    dot.classList.toggle('is-active', i === current);
  });
  spCaption.textContent = IMAGES[current].caption;
  updateTapHint();
}

// =============================================
// TAP HINTの表示制御
// =============================================
function updateTapHint() {
  var hint = document.getElementById('spTapHint');
  if (!hint) return;
  hint.style.display = (isSP && IMAGES[current].name) ? 'block' : 'none';
}

// =============================================
// 共通：切り替え
// =============================================
function goTo(index) {
  if (isAnimating) return;
  isAnimating = true;

  var raw = index;
  current = idx(raw);

  if (!isSP) {
    updatePC(true);
    // isAnimatingはupdatePC内のsetTimeoutでリセット
  } else {
    var vw    = window.innerWidth;
    var sideW = vw * 0.10;
    var gap   = vw * 0.025;

    if (raw < 0) {
      // 前端クローン→実体へ瞬間移動
      var offClone = sideW + gap - 0 * spSlideW;
      spTrack.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      spTrack.style.transform  = 'translateX(' + offClone + 'px)';
      setTimeout(function () {
        spTrack.style.transition = 'none';
        spTrack.style.transform  = 'translateX(' + (sideW + gap - (current + 1) * spSlideW) + 'px)';
        updateSPClasses();
        isAnimating = false;
      }, 460);
    } else if (raw >= total) {
      // 後端クローン→実体へ瞬間移動
      var offClone2 = sideW + gap - (total + 1) * spSlideW;
      spTrack.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      spTrack.style.transform  = 'translateX(' + offClone2 + 'px)';
      setTimeout(function () {
        spTrack.style.transition = 'none';
        spTrack.style.transform  = 'translateX(' + (sideW + gap - (current + 1) * spSlideW) + 'px)';
        updateSPClasses();
        isAnimating = false;
      }, 460);
    } else {
      var offset = sideW + gap - (current + 1) * spSlideW;
      spTrack.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      spTrack.style.transform  = 'translateX(' + offset + 'px)';
      updateSPClasses();
      setTimeout(function () { isAnimating = false; }, 460);
    }
  }
}

function goNext() { goTo(current + 1); }
function goPrev() { goTo(current - 1); }

// =============================================
// オーバーレイ
// =============================================
function openProductOverlay(imgData) {
  var overlay = document.getElementById('productOverlay');
  if (!overlay) return;

  var bgSrc = isSP ? imgData.sp : imgData.src;
  overlay.querySelector('.po-bg').style.backgroundImage = "url('" + bgSrc + "')";
  overlay.querySelector('.po-name').textContent     = imgData.name     || '';
  overlay.querySelector('.po-material').textContent = imgData.material ? '素材：' + imgData.material : '';
  overlay.querySelector('.po-sizes').textContent    = imgData.sizes    ? 'サイズ：' + imgData.sizes   : '';

  var btn = overlay.querySelector('.po-btn');
  btn.style.display = imgData.url ? 'inline-flex' : 'none';
  if (imgData.url) btn.href = imgData.url;

  if (isSP) {
    // SP：スライダーのメイン画像の位置に合わせる
    var spSlider = document.getElementById('spSlider');
    var mainSlide = spSlider ? spSlider.querySelector('.sp-slide.is-main') : null;
    if (mainSlide) {
      var r = mainSlide.getBoundingClientRect();
      overlay.style.top    = r.top  + 'px';
      overlay.style.left   = r.left + 'px';
      overlay.style.width  = r.width  + 'px';
      overlay.style.height = r.height + 'px';
    } else {
      overlay.style.top = overlay.style.left = '0';
      overlay.style.width = overlay.style.height = '100%';
    }
  } else {
    // PC：pcMainの位置に合わせる
    var pcMain = document.getElementById('pcMain');
    if (pcMain) {
      var r = pcMain.getBoundingClientRect();
      overlay.style.top    = r.top  + 'px';
      overlay.style.left   = r.left + 'px';
      overlay.style.width  = r.width  + 'px';
      overlay.style.height = r.height + 'px';
    }
  }

  overlay.classList.add('is-open');
}

function closeProductOverlay() {
  var overlay = document.getElementById('productOverlay');
  if (overlay) overlay.classList.remove('is-open');
}

function toggleProductOverlay() {
  var overlay = document.getElementById('productOverlay');
  if (!overlay) return;
  if (overlay.classList.contains('is-open')) {
    closeProductOverlay();
  } else if (IMAGES[current].name) {
    openProductOverlay(IMAGES[current]);
  }
}

// =============================================
// スワイプ（touchstart/touchend）
// =============================================
var touchStartX = 0;
var touchStartY = 0;
var touchMoved  = false;

document.addEventListener('touchstart', function (e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchMoved  = false;
}, { passive: true });

document.addEventListener('touchmove', function (e) {
  var dx = Math.abs(e.touches[0].clientX - touchStartX);
  var dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (dx > 8 || dy > 8) touchMoved = true;
}, { passive: true });

document.addEventListener('touchend', function (e) {
  if (!isSP) return;
  var dx = e.changedTouches[0].clientX - touchStartX;
  var dy = e.changedTouches[0].clientY - touchStartY;

  // 横スワイプ判定：縦より横が大きく40px以上
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= 40) {
    touchMoved = true;
    dx < 0 ? goNext() : goPrev();
  }
}, { passive: true });

// =============================================
// SP：タップでオーバーレイトグル
// （スワイプと分離：touchMovedがfalseの時だけ）
// =============================================
function setupSPTap() {
  var spSlider = document.getElementById('spSlider');
  spSlider.addEventListener('touchend', function (e) {
    if (!isSP) return;
    if (touchMoved) return; // スワイプならスキップ
    if (e.target.closest('.po-close') || e.target.closest('.po-btn')) return;
    toggleProductOverlay();
  }, { passive: true });
}

// =============================================
// キーボード
// =============================================
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
  if (e.key === 'Escape')     closeProductOverlay();
});

// =============================================
// マウスホイール
// =============================================
document.addEventListener('wheel', function (e) {
  if (isSP) return;
  e.preventDefault();
  var now = Date.now();
  if (now - lastWheel < 400) return;
  lastWheel = now;
  (e.deltaY > 0 || e.deltaX > 0) ? goNext() : goPrev();
}, { passive: false });

// =============================================
// レスポンシブ
// =============================================
function checkDevice() {
  isSP = window.innerWidth <= 768;
  var spCap = document.getElementById('spCaption');
  if (spCap) spCap.style.display = isSP ? 'block' : 'none';
  updateTapHint();
}

window.addEventListener('resize', function () {
  checkDevice();
  if (isSP && spTrack) layoutSP(false);
});

// =============================================
// ライトボックス
// =============================================
function openLightbox(src) {
  var lb    = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  if (!lb || !lbImg) return;
  lbImg.src = src;
  lb.classList.add('is-open');
}
function closeLightbox() {
  var lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('is-open');
}

// =============================================
// 初期化
// =============================================
window.addEventListener('load', function () {
  checkDevice();
  buildPC();
  buildSP();
  if (isSP) playEntranceSP();

  // PC：メインエリアクリックでトグル
  document.getElementById('pcMain').addEventListener('click', function (e) {
    if (e.target.closest('.po-close') || e.target.closest('.po-btn')) return;
    var overlay = document.getElementById('productOverlay');
    if (overlay && overlay.classList.contains('is-open')) {
      closeProductOverlay();
    } else if (IMAGES[current].name) {
      openProductOverlay(IMAGES[current]);
    } else {
      openLightbox(IMAGES[current].src);
    }
  });

  // SP：タップ設定
  setupSPTap();

  // ライトボックスを閉じる
  var lb    = document.getElementById('lightbox');
  var lbClose = document.getElementById('lightboxClose');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lightbox__img')) closeLightbox();
  });

  // CLOSEボタン
  var poClose = document.getElementById('poClose');
  if (poClose) poClose.addEventListener('click', closeProductOverlay);

  console.log('[KAENTA] sstyle ready');
});
