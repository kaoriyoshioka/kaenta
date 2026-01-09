// motion.js
document.addEventListener("DOMContentLoaded", () => {
  setupScrollHeader();
  setupFadeIn();
  setupMobileMenu();
});

/* -------------------------
  ヘッダー：スクロールで scrolled クラス付与
-------------------------- */
function setupScrollHeader() {
  const THRESHOLD = 40;

  const update = () => {
    document.body.classList.toggle("scrolled", window.scrollY > THRESHOLD);
  };

  update();

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* -------------------------
  フェードイン：.fade-section を監視
-------------------------- */
function setupFadeIn() {
  const sections = document.querySelectorAll(".fade-section");
  if (!sections.length) return;

  if (!("IntersectionObserver" in window)) {
    sections.forEach((sec) => sec.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -5% 0px" }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* -------------------------
  モバイルメニュー：☰で開閉（スライドダウン） + ☰→×
-------------------------- */
function setupMobileMenu() {
  const btn = document.querySelector(".menu-btn");
  const drawer = document.querySelector(".mobile-drawer");
  if (!btn || !drawer) return;

  const open = () => {
    drawer.classList.add("is-open");
    document.body.classList.add("menu-open");
    btn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    drawer.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
  };

  const toggle = () => {
    const isOpen = drawer.classList.contains("is-open");
    isOpen ? close() : open();
  };

  btn.addEventListener("click", toggle);

  // メニュー内リンクを押したら閉じる
  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) close();
  });

  // ESCで閉じる
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // 画面をPC幅に戻したら強制クローズ
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });

  // 外側クリックで閉じる（必要なら）
  document.addEventListener("click", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    const insideHeader = e.target.closest(".site-header");
    const insideDrawer = e.target.closest(".mobile-drawer");
    if (!insideHeader && !insideDrawer) close();
  });
}
