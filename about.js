console.log("[KAENTA] about.js loaded");

// 入場ふわっ
window.addEventListener("load", () => {
  document.body.classList.add("is-ready");
});

// GSAP/ScrollTrigger
if (!window.gsap || !window.ScrollTrigger) {
  console.error("[KAENTA] GSAP or ScrollTrigger is missing");
} else {
  gsap.registerPlugin(ScrollTrigger);
}

function animateFrom(elem, direction = 1) {
  let x = 0, y = direction * 60;

  if (elem.classList.contains("gs_reveal_fromLeft")) {
    x = -80; y = 0;
  } else if (elem.classList.contains("gs_reveal_fromRight")) {
    x = 80; y = 0;
  }

  gsap.fromTo(elem,
    { x, y, autoAlpha: 0 },
    {
      duration: 1.25,
      x: 0,
      y: 0,
      autoAlpha: 1,
      ease: "expo",
      overwrite: "auto"
    }
  );
}

function hide(elem) {
  gsap.set(elem, { autoAlpha: 0 });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.utils.toArray(".gs_reveal").forEach((elem) => {
    hide(elem);

    ScrollTrigger.create({
      trigger: elem,
      start: "top 85%",
      onEnter: () => animateFrom(elem, 1),
      onEnterBack: () => animateFrom(elem, -1),
      onLeave: () => hide(elem)
    });
  });
});

