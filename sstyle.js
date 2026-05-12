// KAENTA sstyle.js — 無限ループ＋入場アニメーション

var IMAGES = [
  { src: './assets/PC/product01.png',      sp: './assets/SP/product01.jpeg',      caption: '素材の表情を邪魔しない設計。仕立ての線、コバの輪郭、金具の静けさ。' },
  { src: './assets/PC/product02.png',      sp: './assets/SP/product02.jpeg',      caption: '使うほどに、持ち主の時間が宿るものへ。' },
  { src: './assets/PC/product03.png',      sp: './assets/SP/product03.jpeg',      caption: '藍は、深さのグラデーション。海の色は、毎日少しずつ違う。' },
  { src: './assets/PC/cafe01.png',         sp: './assets/SP/cafe01.jpeg',         caption: 'その揺らぎを、プロダクトの表情に。' },
  { src: './assets/PC/about-portrait.png', sp: './assets/SP/about-portrait.jpeg', caption: '余白のある暮らしに、静かな強さを。' },
  { src: './assets/PC/workshop01.png',     sp: './assets/SP/workshop01.jpeg',     caption: '体験は、記憶として残るデザイン。' },
  { src: './assets/PC/about-hero.png',     sp: './assets/SP/about-hero.jpeg',     caption: '手を動かす時間が、ものの価値を深くする。' },
  { src: './assets/PC/shop01.png',         sp: './assets/SP/shop01.jpeg',         caption: '「つくる」から始まる、あなたのKAENTA。' },
  { src: './assets/PC/about-work.png',     sp: './assets/SP/about-work.jpeg',     caption: '流行よりも、時間に耐えるかたち。' },
  { src: './assets/PC/hero-main.png',      sp: './assets/SP/hero-main.jpeg',      caption: '触れた瞬間にわかる、静かな上質。' },
  { src: './assets/PC/workshop02.png',     sp: './assets/SP/workshop02.jpeg',     caption: 'ほんの少しの「凛」と「余白」を、日常へ。' },
  { src: './assets/PC/shop02.png',         sp: './assets/SP/shop02.jpeg',         caption: '海の気配と、手仕事の温度。' },
];

var current     = 0;
var total       = IMAGES.length;
var isAnimating = false;
var isSP        = false;

// インデックスを循環させるヘルパー
function idx(i) { return ((i % total) + total) % total; }

// DOM refs
var pcMainImg   = document.getElementById('pcMainImg');
var pcPrev      = document.getElementById('pcPrev');
var pcNext      = document.getElementById('pcNext');
var pcThumbs    = document.getElementById('pcThumbs');
var captionText = document.getElementById('captionText');
var spTrack     = document.getElementById('spTrack');
var spDots      = document.getElementById('spDots');
var spCaption   = document.getElementById('spCaption');
var lightbox    = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightboxImg');
var lightboxClose = document.getElementById('lightboxClose');

// =============================================
// 入場アニメーション
// =============================================
function playEntrance() {
  // 左右チラ見え：外からスライドイン
  gsap.set('#pcPrev', { x: -60, opacity: 0 });
  gsap.set('#pcNext', { x:  60, opacity: 0 });
  gsap.set('#pcMainImg', { scale: 1.04, opacity: 0, filter: 'blur(6px)' });
  gsap.set('#galleryCaption', { y: 16, opacity: 0 });
  gsap.set('#pcThumbs', { y: 12, opacity: 0 });

  var tl = gsap.timeline({ delay: 0.1 });

  tl.to('#pcMainImg', {
    scale: 1, opacity: 1, filter: 'blur(0px)',
    duration: 1.2, ease: 'power3.out'
  })
  .to('#pcPrev', {
    x: 0, opacity: 1,
    duration: 0.9, ease: 'power3.out'
  }, 0.2)
  .to('#pcNext', {
    x: 0, opacity: 1,
    duration: 0.9, ease: 'power3.out'
  }, 0.2)
  .to('#galleryCaption', {
    y: 0, opacity: 1,
    duration: 0.7, ease: 'power3.out'
  }, 0.5)
  .to('#pcThumbs', {
    y: 0, opacity: 1,
    duration: 0.7, ease: 'power3.out'
  }, 0.6);
}

function playEntranceSP() {
  gsap.set('#spSlider', { opacity: 0, y: 20 });
  gsap.set('#spDots',   { opacity: 0 });
  gsap.set('#spCaption',{ opacity: 0, y: 8 });

  gsap.timeline({ delay: 0.2 })
    .to('#spSlider', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' })
    .to('#spCaption', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.4)
    .to('#spDots', { opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.5);
}

// =============================================
// PC：ビルド
// =============================================
function buildPC() {
  // サムネイル
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
  var p = idx(current - 1);
  var n = idx(current + 1);

  if (animate === false) {
    // 初期セット（アニメなし）
    pcMainImg.src = IMAGES[current].src;
  } else {
    // メイン：フェード切り替え
    pcMainImg.classList.add('is-changing');
    setTimeout(function () {
      pcMainImg.src = IMAGES[current].src;
      pcMainImg.classList.remove('is-changing');
    }, 300);
  }

  // 左右：各2枚横並び（無限ループ）
  var pp = idx(current - 2);
  var nn = idx(current + 2);

  // 左グループ：外側=2つ前、内側=1つ前
  pcPrev.innerHTML =
    '<div class="side-img" data-goto="' + pp + '">' +
      '<img src="' + IMAGES[pp].src + '" alt="" loading="lazy"></div>' +
    '<div class="side-img" data-goto="' + p + '">' +
      '<img src="' + IMAGES[p].src  + '" alt="" loading="lazy"></div>';

  // 右グループ：内側=1つ後、外側=2つ後
  pcNext.innerHTML =
    '<div class="side-img" data-goto="' + n + '">' +
      '<img src="' + IMAGES[n].src  + '" alt="" loading="lazy"></div>' +
    '<div class="side-img" data-goto="' + nn + '">' +
      '<img src="' + IMAGES[nn].src + '" alt="" loading="lazy"></div>';

  // side-img クリックで切り替え
  document.querySelectorAll('.side-img').forEach(function (el) {
    el.style.cursor = 'pointer';
    el.onclick = function () {
      var g = parseInt(el.dataset.goto);
      goTo(g);
    };
  });

  pcPrev.onclick = null;
  pcNext.onclick = null;

  // サムネイルactive
  pcThumbs.querySelectorAll('.pc-thumb').forEach(function (el, i) {
    el.classList.toggle('is-active', i === current);
  });

  captionText.textContent = IMAGES[current].caption;
}

// =============================================
// SP：ビルド（無限ループ対応）
// =============================================
function buildSP() {
  spTrack.innerHTML = '';
  spDots.innerHTML  = '';

  // クローンを両端に追加してループ感を出す
  // 構成：[last] [0] [1] ... [n-1] [first]
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

var spSlideW = 0;

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

  // クローン込みで (current + 1) 番目がメイン
  var realIdx = current + 1;
  var offset  = sideW + gap - realIdx * spSlideW;

  spTrack.style.transition = withTransition === false ? 'none' : 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
  spTrack.style.transform  = 'translateX(' + offset + 'px)';

  updateSPClasses();
}

function updateSPClasses() {
  var slides = spTrack.querySelectorAll('.sp-slide');
  var realIdx = current + 1; // クローン分ずらす
  slides.forEach(function (slide, i) {
    slide.classList.toggle('is-main', i === realIdx);
    slide.classList.toggle('is-side', i !== realIdx);
  });

  spDots.querySelectorAll('.sp-dot').forEach(function (dot, i) {
    dot.classList.toggle('is-active', i === current);
  });

  spCaption.textContent = IMAGES[current].caption;
}

// =============================================
// 共通：切り替え（無限ループ）
// =============================================
function goTo(index) {
  if (isAnimating) return;
  isAnimating = true;

  // 無限ループ：indexをそのまま使い、表示後にnormalizeする
  var raw = index;
  current = idx(raw);

  if (!isSP) {
    updatePC(true);
    setTimeout(function () { isAnimating = false; }, 400);
  } else {
    // SPのループ処理
    var vw    = window.innerWidth;
    var sideW = vw * 0.10;
    var gap   = vw * 0.025;

    if (raw < 0) {
      // 前端クローンに飛んでからリセット
      var cloneIdx = 0; // clonePrevは index 0
      var offsetClone = sideW + gap - cloneIdx * spSlideW;
      spTrack.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      spTrack.style.transform  = 'translateX(' + offsetClone + 'px)';

      setTimeout(function () {
        // アニメなしで末尾の実体に飛ぶ
        var realIdx = current + 1;
        var offset  = sideW + gap - realIdx * spSlideW;
        spTrack.style.transition = 'none';
        spTrack.style.transform  = 'translateX(' + offset + 'px)';
        updateSPClasses();
        isAnimating = false;
      }, 460);

    } else if (raw >= total) {
      // 後端クローンに飛んでからリセット
      var cloneIdx2 = total + 1;
      var offsetClone2 = sideW + gap - cloneIdx2 * spSlideW;
      spTrack.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      spTrack.style.transform  = 'translateX(' + offsetClone2 + 'px)';

      setTimeout(function () {
        var realIdx = current + 1;
        var offset  = sideW + gap - realIdx * spSlideW;
        spTrack.style.transition = 'none';
        spTrack.style.transform  = 'translateX(' + offset + 'px)';
        updateSPClasses();
        isAnimating = false;
      }, 460);

    } else {
      var realIdx = current + 1;
      var offset  = sideW + gap - realIdx * spSlideW;
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
// SP スワイプ
// =============================================
var touchX = 0, touchY = 0;
document.addEventListener('touchstart', function (e) {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', function (e) {
  if (!isSP) return;
  var dx = e.changedTouches[0].clientX - touchX;
  var dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 40) return;
  dx < 0 ? goNext() : goPrev();
}, { passive: true });

// キーボード
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') goNext();
  if (e.key === 'ArrowLeft')  goPrev();
});

// =============================================
// マウスホイールで左右切り替え（PC）
// =============================================
var wheelCooldown = false;

document.addEventListener('wheel', function (e) {
  if (isSP) return;
  if (wheelCooldown) return;

  e.preventDefault();

  if (e.deltaY > 0 || e.deltaX > 0) {
    goNext();
  } else {
    goPrev();
  }

  // 連続発火を防ぐ（アニメ時間より少し長め）
  wheelCooldown = true;
  setTimeout(function () { wheelCooldown = false; }, 600);

}, { passive: false });

// =============================================
// ライトボックス
// =============================================
pcMainImg.addEventListener('click', function () {
  lightboxImg.src = IMAGES[current].src;
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', function (e) {
  if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});
function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

// =============================================
// 初期化
// =============================================
function checkDevice() {
  isSP = window.innerWidth <= 768;
  spCaption.style.display = isSP ? 'block' : 'none';
}

window.addEventListener('resize', function () {
  checkDevice();
  if (isSP) layoutSP(false);
});

window.addEventListener('load', function () {
  checkDevice();
  buildPC();
  buildSP();
  if (isSP) playEntranceSP();
  console.log('[KAENTA] sstyle ready');
});
