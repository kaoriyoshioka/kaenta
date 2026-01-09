document.addEventListener("DOMContentLoaded", () => {
  // ヘッダー読み込み
  fetch("header.html")
    .then((res) => res.text())
    .then((html) => {
      const headerTag = document.querySelector("header");
      if (headerTag) headerTag.outerHTML = html;
    })
    .then(() => {
      setupSmoothScroll();
      setupScrollHeader();
      setupFadeIn();
      setupMobileMenu();
    })
    .catch((err) => console.error(err));

  // フッター読み込み
  fetch("footer.html")
    .then((res) => res.text())
    .then((html) => {
      const footerTag = document.querySelector("footer");
      if (footerTag) footerTag.outerHTML = html;
    })
    .catch((err) => console.error(err));
});

/* アンカーリンクをスムーズスクロールに */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      const rect = targetEl.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: rect, behavior: "smooth" });
    });
  });
}

/* スクロールでヘッダーを縮める（body.scrolled 付与） */
function setupScrollHeader() {
  const update = () => {
    document.body.classList.toggle("scrolled", window.scrollY > 10);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* セクションのフェードイン */
function setupFadeIn() {
  const sections = document.querySelectorAll(".fade-section");
  if (!sections.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((sec) => observer.observe(sec));
  } else {
    sections.forEach((sec) => sec.classList.add("is-visible"));
  }
}

/* スマホ用メニュー（開閉） */
function setupMobileMenu() {
  const btn = document.querySelector(".menu-btn");
  const drawer = document.querySelector(".mobile-drawer");
  if (!btn || !drawer) return;

  const open = () => {
    drawer.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  };

  const close = () => {
    drawer.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  btn.addEventListener("click", () => {
    const isOpen = drawer.classList.contains("is-open");
    isOpen ? close() : open();
  });

  // メニュー内リンク押したら閉じる
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  // 外側クリックで閉じる
  document.addEventListener("click", (e) => {
    if (!drawer.classList.contains("is-open")) return;
    if (btn.contains(e.target) || drawer.contains(e.target)) return;
    close();
  });

  // 画面が広がったら閉じる
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });
}

