console.log("[KAENTA] sstyle.js loaded");

if (!window.gsap || !window.ScrollTrigger) {
  console.error("[KAENTA] GSAP or ScrollTrigger is missing");
} else {
  gsap.registerPlugin(ScrollTrigger);
}

// =========================
// Images
// =========================
const IMAGES = [
  "about-hero.png",
  "about-portrait.png",
  "about-work.png",
  "article01.png",
  "article02.png",
  "article03.png",
  "cafe01.png",
  "cafe02.png",
  "hero-logo.png",
  "hero-main.png",
  "hero-main2.png",
  "indigo-hero.png",
  "product01.png",
  "product02.png",
  "product03.png",
  "shop01.png",
  "shop02.png",
  "workshop01.png",
  "workshop02.png"
].map(f => `./assets/${f}`);

const CAPTIONS = [
  { title: "ABOUT HERO", items: ["Ocean View Atelier", "Quiet luxury", "Monochrome mood"] },
  { title: "PORTRAIT", items: ["Portrait series", "Soft contrast", "Studio tone"] },
  { title: "ABOUT WORK", items: ["Craft process", "Handmade detail", "Texture focus"] },
  { title: "ARTICLE 01", items: ["Editorial", "Minimal layout", "Airy spacing"] },
  { title: "ARTICLE 02", items: ["Story", "Light & shadow", "Rhythm"] },
  { title: "ARTICLE 03", items: ["Concept", "Material", "Form"] },
  { title: "CAFE 01", items: ["Local spot", "Calm palette", "Daily scene"] },
  { title: "CAFE 02", items: ["Coffee time", "Warm tone", "Slow moment"] },
  { title: "HERO LOGO", items: ["Identity", "Typography", "Balance"] },
  { title: "HERO MAIN", items: ["Key visual", "Statement", "Atmosphere"] },
  { title: "HERO MAIN 2", items: ["Variation", "Perspective", "Depth"] },
  { title: "INDIGO HERO", items: ["Indigo", "Ocean", "Dyeing"] },
  { title: "PRODUCT 01", items: ["Leather", "Aging", "Stitch"] },
  { title: "PRODUCT 02", items: ["Form", "Function", "Finish"] },
  { title: "PRODUCT 03", items: ["Details", "Edge paint", "Hardware"] },
  { title: "SHOP 01", items: ["Shop", "Display", "Light"] },
  { title: "SHOP 02", items: ["Space", "Silence", "Flow"] },
  { title: "WORKSHOP 01", items: ["Workshop", "Hands-on", "Tools"] },
  { title: "WORKSHOP 02", items: ["Experience", "Indigo bath", "Take home"] },
];

const captionTitle = document.getElementById("captionTitle");
const captionList  = document.getElementById("captionList");

const cardsWrap = document.querySelector(".cards");
const cards = Array.from(document.querySelectorAll(".cards .card"));

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
  cards.forEach((card, i) => {
    const imgIndex = (i + seedVal) % IMAGES.length;
    card.style.backgroundImage = `url("${IMAGES[imgIndex]}")`;
    card.dataset.imgIndex = String(imgIndex);
  });
}

// =========================
// Entry UI (ヘッダー/キャプション/ボタンだけ)
// =========================
function playEnterUI() {
  if (!window.gsap) return;
  gsap.to(".page-enter", { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 });
}

// =========================
// Loop globals
// =========================
let trigger, scrub, seamlessLoop, gsapCards;
let iteration = 0;
const spacing = 0.1;

// =========================
// Auto spin intro（最初から回す）
// =========================
function playAutoSpinIntro({ duration = 1.3, steps = 7, direction = 1 } = {}) {
  if (!scrub || !seamlessLoop || !gsapCards) return;

  const gallery = document.querySelector(".gallery");
  if (gallery) gallery.classList.add("is-glow");

  const fromTime = scrub.vars.totalTime || 0;
  const toTime   = fromTime + direction * steps * spacing;

  gsap.to(scrub.vars, {
    totalTime: toTime,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      scrub.invalidate().restart();

      const step = Math.round(scrub.vars.totalTime / spacing);
      const active = gsapCards[((step % gsapCards.length) + gsapCards.length) % gsapCards.length];
      const imgIndex = Number(active.dataset.imgIndex || 0);
      setCaptionByIndex(imgIndex);

      gsapCards.forEach(c => c.classList.remove("is-center"));
      active.classList.add("is-center");
    },
    onComplete: () => {
      if (gallery) gallery.classList.remove("is-glow");
    }
  });
}

// =========================
// Init seamless loop
// =========================
function initLoop() {
  if (!window.gsap || !window.ScrollTrigger) return;

  iteration = 0;

  // ★最重要：初期フレームの「1枚だけ」を消す
  // cardsはCSSで visibility:hidden。ここで準備完了後に表示する。
  if (cardsWrap) cardsWrap.classList.remove("is-ready");

  const snap = gsap.utils.snap(spacing);
  gsapCards = gsap.utils.toArray(".cards li");
  seamlessLoop = buildSeamlessLoop(gsapCards, spacing);

  scrub = gsap.to(seamlessLoop, {
    totalTime: 0,
    duration: 0.5,
    ease: "power3",
    paused: true
  });

  trigger = ScrollTrigger.create({
    start: 0,
    end: "+=3000",
    pin: ".gallery",
    onUpdate(self) {
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

      const step = Math.round(scrub.vars.totalTime / spacing);
      const active = gsapCards[((step % gsapCards.length) + gsapCards.length) % gsapCards.length];
      const imgIndex = Number(active.dataset.imgIndex || 0);
      setCaptionByIndex(imgIndex);

      gsapCards.forEach(c => c.classList.remove("is-center"));
      active.classList.add("is-center");
    }
  });

  // 初期位置確定（ここまで終わってから見せる）
  scrub.vars.totalTime = spacing * 2;
  scrub.invalidate().restart();
  trigger.scroll(trigger.start + 1);

  // ★準備できた瞬間に表示（これで“1枚だけ”が消える）
  if (cardsWrap) cardsWrap.classList.add("is-ready");

  // Prev/Next
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  function scrubTo(totalTime) {
    const progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();

    if (progress > 1) {
      iteration++;
      trigger.wrapping = true;
      trigger.scroll(trigger.start + 1);
    } else if (progress < 0) {
      iteration--;
      trigger.wrapping = true;
      trigger.scroll(trigger.end - 1);
    } else {
      trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
    }
  }

  if (nextBtn) nextBtn.addEventListener("click", () => {
    seed = (seed + 1) % IMAGES.length;
    applyImages(seed);
    setCaptionBySeed(seed);
    scrubTo(scrub.vars.totalTime + spacing);
  });

  if (prevBtn) prevBtn.addEventListener("click", () => {
    seed = (seed - 1 + IMAGES.length) % IMAGES.length;
    applyImages(seed);
    setCaptionBySeed(seed);
    scrubTo(scrub.vars.totalTime - spacing);
  });
}

// =========================
// buildSeamlessLoop（基本はあなたのまま）
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

  // 初期セット（これが“表示前”に走るのが大事）
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

  initLoop();              // ★先に回転の準備を完了 → cardsを表示
  ScrollTrigger.refresh();

  playEnterUI();           // UIふわっと
  playAutoSpinIntro({ duration: 1, steps: 5, direction: 3}); // ★開いた瞬間から回る
});

// Refresh Background
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    seed = (seed + 1) % IMAGES.length;
    applyImages(seed);
    setCaptionBySeed(seed);
  });
}
