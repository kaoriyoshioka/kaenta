console.log("[KAENTA] sstyle.js loaded");

// =========================
// GSAP check
// =========================
if (!window.gsap) {
  console.error("[KAENTA] GSAP is missing");
}
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================
// Device + image resolver
// =========================
const mqSP = window.matchMedia("(max-width: 820px)"); // CSSと合わせる
const isSP = () => mqSP.matches;

// ベース名だけ管理（拡張子・フォルダは自動）
const IMAGE_BASES = [
  "about-hero",
  "about-portrait",
  "about-work",
  "article01",
  "article02",
  "article03",
  "cafe01",
  "cafe02",
  "hero-logo",
  "hero-main",
  "hero-main2",
  "indigo-hero",
  "product01",
  "product02",
  "product03",
  "shop01",
  "shop02",
  "workshop01",
  "workshop02"
];

function resolveImageSrc(baseName) {
  return isSP()
    ? `./assets/SP/${baseName}.jpeg`
    : `./assets/PC/${baseName}.png`;
}

function buildImages() {
  return IMAGE_BASES.map(resolveImageSrc);
}

let IMAGES = buildImages();

// =========================
// Captions（IMAGE_BASESと順番一致）
// =========================
const CAPTIONS = [
  { title: "ABOUT HERO",   items: ["Ocean View Atelier", "Quiet luxury", "Monochrome mood"] },
  { title: "PORTRAIT",     items: ["Portrait series", "Soft contrast", "Studio tone"] },
  { title: "ABOUT WORK",   items: ["Craft process", "Handmade detail", "Texture focus"] },
  { title: "ARTICLE 01",   items: ["Editorial", "Minimal layout", "Airy spacing"] },
  { title: "ARTICLE 02",   items: ["Story", "Light & shadow", "Rhythm"] },
  { title: "ARTICLE 03",   items: ["Concept", "Material", "Form"] },
  { title: "CAFE 01",      items: ["Local spot", "Calm palette", "Daily scene"] },
  { title: "CAFE 02",      items: ["Coffee time", "Warm tone", "Slow moment"] },
  { title: "HERO LOGO",    items: ["Identity", "Typography", "Balance"] },
  { title: "HERO MAIN",    items: ["Key visual", "Statement", "Atmosphere"] },
  { title: "HERO MAIN 2",  items: ["Variation", "Perspective", "Depth"] },
  { title: "INDIGO HERO",  items: ["Indigo", "Ocean", "Dyeing"] },
  { title: "PRODUCT 01",   items: ["Leather", "Aging", "Stitch"] },
  { title: "PRODUCT 02",   items: ["Form", "Function", "Finish"] },
  { title: "PRODUCT 03",   items: ["Details", "Edge paint", "Hardware"] },
  { title: "SHOP 01",      items: ["Shop", "Display", "Light"] },
  { title: "SHOP 02",      items: ["Space", "Silence", "Flow"] },
  { title: "WORKSHOP 01",  items: ["Workshop", "Hands-on", "Tools"] },
  { title: "WORKSHOP 02",  items: ["Experience", "Indigo bath", "Take home"] },
];

// =========================
// DOM refs
// =========================
const captionTitle = document.getElementById("captionTitle");
const captionList  = document.getElementById("captionList");

const cardsWrap = document.querySelector(".cards");
const cards = Array.from(document.querySelectorAll(".cards .card"));

const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const gallery = document.querySelector(".gallery");

let seed = 0;

// =========================
// Caption
// =========================
function setCaptionByIndex(imgIndex) {
  if (!captionTitle || !captionList) return;

  const idx = ((imgIndex % IMAGES.length) + IMAGES.length) % IMAGES.length;
  const cap = CAPTIONS[idx] || { title: "STYLE", items: [] };

  captionTitle.textContent = cap.title;
  captionList.innerHTML = cap.items.map(t => `<li>${t}</li>`).join("");
}
function setCaptionBySeed(seedVal) {
  const idx = ((seedVal % IMAGES.length) + IMAGES.length) % IMAGES.length;
  setCaptionByIndex(idx);
}

// =========================
// Apply images
// =========================
function applyImages(seedVal = 0) {
  IMAGES = buildImages();

  cards.forEach((card, i) => {
    const imgIndex = (i + seedVal) % IMAGES.length;
    card.style.backgroundImage = `url("${IMAGES[imgIndex]}")`;
    card.dataset.imgIndex = String(imgIndex);
  });
}

// =========================
// Entry UI
// =========================
function playEnterUI() {
  if (!window.gsap) return;
  gsap.to(".page-enter", {
    opacity: 1,
    y: 0,
    duration: 0.55,
    ease: "power3.out",
    stagger: 0.06
  });
}

// =========================
// Loop globals
// =========================
let trigger = null;
let scrub = null;
let seamlessLoop = null;
let gsapCards = null;

let iteration = 0;
const spacing = 0.1;

// =========================
// Helpers
// =========================
function updateActiveByScrub() {
  if (!scrub || !gsapCards) return;

  const step = Math.round(scrub.vars.totalTime / spacing);
  const active = gsapCards[((step % gsapCards.length) + gsapCards.length) % gsapCards.length];
  const imgIndex = Number(active.dataset.imgIndex || 0);

  setCaptionByIndex(imgIndex);
  gsapCards.forEach(c => c.classList.remove("is-center"));
  active.classList.add("is-center");
}

function scrubTo(totalTime) {
  if (!scrub) return;
  scrub.vars.totalTime = totalTime;
  scrub.invalidate().restart();
  updateActiveByScrub();
}

function destroyPCScroll() {
  if (trigger) {
    trigger.kill();
    trigger = null;
  }
  // ScrollTriggerが存在する場合の安全なrefresh
  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

// =========================
// Init (PC/SP split)
// =========================
function initLoop() {
  if (!window.gsap) return;

  const mobile = isSP();

  iteration = 0;

  // 初期チラ見え防止：準備できるまで隠す
  if (cardsWrap) cardsWrap.classList.remove("is-ready");

  // 参照更新（端末切替でもOKにする）
  applyImages(seed);
  setCaptionBySeed(seed);

  gsapCards = gsap.utils.toArray(".cards li");
  seamlessLoop = buildSeamlessLoop(gsapCards, spacing);

  scrub = gsap.to(seamlessLoop, {
    totalTime: 0,
    duration: 0.5,
    ease: "power3",
    paused: true
  });

  // 初期位置
  scrubTo(spacing * 2);

  // 準備できた瞬間に表示
  if (cardsWrap) cardsWrap.classList.add("is-ready");

  // ---- PC：縦スクロール連動 ----
  if (!mobile && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    trigger = ScrollTrigger.create({
      start: 0,
      end: "+=3000",
      pin: ".gallery",
      onUpdate(self) {
        const snap = gsap.utils.snap(spacing);

        if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
          iteration++;
          self.wrapping = true;
          self.scroll(self.start + 1);
        } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
          iteration--;
          if (iteration < 0) {
            iteration = 9;
            seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
            scrub.pause();
          }
          self.wrapping = true;
          self.scroll(self.end - 1);
        } else {
          scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
          scrub.invalidate().restart();
          self.wrapping = false;
        }

        updateActiveByScrub();
      }
    });

    // PC初期位置
    scrub.vars.totalTime = spacing * 2;
    scrub.invalidate().restart();
    trigger.scroll(trigger.start + 1);
    updateActiveByScrub();

  } else {
    // ---- SP：縦スクロール不要（pin/ScrollTriggerなし） ----
    destroyPCScroll();
  }

  // ボタン（共通）
  if (nextBtn) {
    nextBtn.onclick = () => {
      seed = (seed + 1) % IMAGES.length;
      applyImages(seed);
      setCaptionBySeed(seed);
      scrubTo(scrub.vars.totalTime + spacing);
    };
  }
  if (prevBtn) {
    prevBtn.onclick = () => {
      seed = (seed - 1 + IMAGES.length) % IMAGES.length;
      applyImages(seed);
      setCaptionBySeed(seed);
      scrubTo(scrub.vars.totalTime - spacing);
    };
  }

  // ---- SP：横スワイプのみ ----
  if (mobile && gallery) {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    gallery.addEventListener("touchstart", (e) => {
      if (!isSP()) return;
      if (!e.touches || e.touches.length !== 1) return;

      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    gallery.addEventListener("touchend", (e) => {
      if (!tracking) return;
      tracking = false;
      if (!isSP()) return;

      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // 縦成分が強い時は無視（ただしSPはoverflow hidden想定）
      if (Math.abs(dy) > Math.abs(dx)) return;

      const TH = 40;
      if (Math.abs(dx) < TH) return;

      // 右スワイプ = Prev / 左スワイプ = Next
      if (dx > 0) {
        seed = (seed - 1 + IMAGES.length) % IMAGES.length;
        applyImages(seed);
        setCaptionBySeed(seed);
        scrubTo(scrub.vars.totalTime - spacing);
      } else {
        seed = (seed + 1) % IMAGES.length;
        applyImages(seed);
        setCaptionBySeed(seed);
        scrubTo(scrub.vars.totalTime + spacing);
      }
    }, { passive: true });
  }
}

// =========================
// Auto spin intro（任意：SPは軽め）
// =========================
function playAutoSpinIntro() {
  if (!scrub) return;

  const mobile = isSP();
  const steps = mobile ? 2 : 5;
  const duration = mobile ? 0.6 : 1.0;

  if (gallery) gallery.classList.add("is-glow");

  const toTime = (scrub.vars.totalTime || 0) + steps * spacing;

  gsap.to(scrub.vars, {
    totalTime: toTime,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      scrub.invalidate().restart();
      updateActiveByScrub();
    },
    onComplete: () => {
      if (gallery) gallery.classList.remove("is-glow");
    }
  });
}

// =========================
// buildSeamlessLoop
// =========================
function buildSeamlessLoop(items, spacing) {
  const overlap = Math.ceil(1 / spacing);
  const startTime = items.length * spacing + 0.5;
  const loopTime = (items.length + overlap) * spacing + 1;

  const rawSequence = gsap.timeline({ paused: true });
  const loop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      this._time === this._dur && (this._tTime += this._dur - 0.01);
    }
  });

  // 初期セット
  gsap.set(items, { xPercent: 300, opacity: 0, scale: 0 });

  const l = items.length + overlap * 2;
  for (let i = 0; i < l; i++) {
    const index = i % items.length;
    const item = items[index];
    const time = i * spacing;

    rawSequence
      .fromTo(
        item,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          zIndex: 100,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          ease: "power1.in",
          immediateRender: false
        },
        time
      )
      .fromTo(
        item,
        { xPercent: 300 },
        { xPercent: -300, duration: 1, ease: "none", immediateRender: false },
        time
      );

    i <= items.length && loop.add("label" + i, time);
  }

  rawSequence.time(startTime);
  loop
    .to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" })
    .fromTo(
      rawSequence,
      { time: overlap * spacing + 1 },
      { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" }
    );

  return loop;
}

// =========================
// Load
// =========================
window.addEventListener("load", () => {
  applyImages(seed);
  setCaptionBySeed(seed);

  initLoop();
  playEnterUI();
  playAutoSpinIntro();
});

// 端末幅が変わったら再初期化（PC⇄SP）
mqSP.addEventListener?.("change", () => {
  // 既存のScrollTriggerを殺して作り直す
  destroyPCScroll();
  initLoop();
});
