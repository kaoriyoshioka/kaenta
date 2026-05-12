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

  // --- 画像の読み込み完了を待つ ---
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

  // --- 列の内容を複製（ループの肝） ---
  function buildPerfectLoop(col) {
    const base = Array.from(col.children);
    if (!base.length) return;

    col.innerHTML = "";
    base.forEach((el) => col.appendChild(el));
    base.forEach((el) => col.appendChild(el.cloneNode(true)));

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

  // =============================================
  // カラー演出：画面中央に近い画像ほどカラーになる
  // =============================================
  const gallery = document.querySelector(".gallery");

  function updateColorEffect() {
    if (!gallery) return;

    const galleryRect = gallery.getBoundingClientRect();
    const centerY = galleryRect.top + galleryRect.height / 2;
    // 中央列（index=1）は常に少しカラー気味にしたいので列ごとに強度を変える
    const colIntensity = [0.6, 1.0, 0.6]; // 左・中・右

    cols.forEach((col, colIndex) => {
      const imgs = col.querySelectorAll("img");
      imgs.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const imgCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(imgCenterY - centerY);
        const maxDist = galleryRect.height * 0.55;

        // 0（遠い）〜 1（中央）の値
        const proximity = Math.max(0, 1 - distance / maxDist);

        // 列の強度も掛け合わせる
        const saturation = proximity * colIntensity[colIndex] ?? proximity;

        img.style.filter = `saturate(${saturation})`;
      });
    });
  }

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

    // 毎フレーム色を更新
    updateColorEffect();
  };

  gsap.ticker.add(tick);

  // --- スクロールで加速 ---
  ScrollTrigger.create({
    trigger: spacer,
    start: "top top",
    end: "bottom bottom",
    onUpdate(self) {
      const v = self.getVelocity();
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

  // --- リサイズ対応 ---
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
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
