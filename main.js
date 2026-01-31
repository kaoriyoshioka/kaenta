window.addEventListener("load", async () => {
  console.log("[KAENTA] main.js loaded");

  if (!window.gsap || !window.ScrollTrigger) {
    console.error("[KAENTA] GSAP or ScrollTrigger is missing");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const cols = gsap.utils.toArray(".col");
  const spacer = document.querySelector(".spacer");
  if (!cols.length || !spacer) return;

  // --- 画像の読み込み完了を待つ（高さ確定させる） ---
  const images = Array.from(document.images);
  await Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          })
    )
  );

  // --- 列の内容を「偶数回」複製して、前半=後半を保証（ここがLOOPの肝） ---
  function buildPerfectLoop(col) {
    const base = Array.from(col.children);
    if (!base.length) return;

    // 一度高さを確定させる
    const baseHeights = () => base.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);

    // まず最低2回（前半=後半）
    col.innerHTML = "";
    base.forEach((el) => col.appendChild(el));
    base.forEach((el) => col.appendChild(el.cloneNode(true)));

    // さらに必要なら「2セットずつ」増やす（常に偶数セット）
    // 目標：画面高さの3倍くらい（高速スクロールでも破綻しにくい）
    const target = window.innerHeight * 3;
    while (col.scrollHeight < target) {
      base.forEach((el) => col.appendChild(el.cloneNode(true)));
      base.forEach((el) => col.appendChild(el.cloneNode(true)));
    }
  }

  cols.forEach(buildPerfectLoop);

  // --- ループ用 state / setter ---
  const states = cols.map(() => ({ y: 0 }));
  const setters = cols.map((col) => gsap.quickSetter(col, "y", "px"));

  const getHalf = (col) => col.scrollHeight / 2;

  // --- ticker（止まらないベース移動） ---
  const tick = () => {
    cols.forEach((col, i) => {
      const dir = Number(col.dataset.dir || 1);
      const baseSpeed = (0.65 + i * 0.12) * dir;

      const half = getHalf(col);
      const wrap = gsap.utils.wrap(-half, 0);

      states[i].y = wrap(states[i].y + baseSpeed);
      setters[i](states[i].y);
    });
  };

  gsap.ticker.add(tick);

  // --- スクロールで加速（慣性っぽく） ---
  ScrollTrigger.create({
    trigger: spacer,
    start: "top top",
    end: "bottom bottom",
    onUpdate(self) {
      const v = self.getVelocity(); // px/sec
      const accel = v * 0.0025;

      cols.forEach((col, i) => {
        const dir = Number(col.dataset.dir || 1);
        const half = getHalf(col);
        const wrap = gsap.utils.wrap(-half, 0);

        states[i].y = wrap(states[i].y + accel * dir);
        setters[i](states[i].y);
      });
    }
  });

  // --- リサイズ / 向き変更で破綻しないよう再構築 ---
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // 位置をいったん正規化
      cols.forEach((col, i) => {
        const half = getHalf(col);
        const wrap = gsap.utils.wrap(-half, 0);
        states[i].y = wrap(states[i].y);
        setters[i](states[i].y);
      });

      ScrollTrigger.refresh();
    }, 150);
  });

  ScrollTrigger.refresh();
  console.log("[KAENTA] perfect loop initialized");
});
