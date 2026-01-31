// ======================
// posts（ここだけ編集）
// ======================
const posts = [
  { key:"NOTE",   title:"余白の設計",         image:"./assets/article01.png", url:"./posts/post-001.html", desc:"空気が通る余白。視線の逃げ道。触れる前に伝わる“間”の設計。" },
  { key:"INDIGO", title:"藍の深さ",           image:"./assets/article02.png", url:"./posts/post-002.html", desc:"青ではなく、藍。染料の層が生む暗さと透明のバランス。" },
  { key:"LEATHER",title:"経年というデザイン",  image:"./assets/article03.png", url:"./posts/post-003.html", desc:"使い込むほどに輪郭が整う。劣化ではなく、情報が増える。" },
];

// ===== util =====
const throttle = (fn, wait = 16) => {
  let last = 0, timer;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
};

// ===== build DOM =====
const timelineList = document.getElementById("timelineList");
const main = document.getElementById("main");

// timeline links
timelineList.innerHTML = posts.map((p, i) => `
  <li>
    <a href="#section_${i+1}" class="nav__link" data-link><span>${p.key}</span></a>
  </li>
`).join("");

// sections
main.innerHTML = posts.map((p, i) => `
  <section id="section_${i+1}" style="--i:${i}">
    <div class="container">
      <div>
        <h2 class="heading">
          <span class="kicker">${p.key}</span>
          <span class="title">${p.title}</span>
        </h2>
        <p class="desc">${p.desc ?? ""}</p>

        <div class="actions">
          <a class="btn" href="${p.url}" data-open="${p.url}">Read</a>
          <a class="btn" href="${p.url}" target="_blank" rel="noopener">New Tab</a>
        </div>
      </div>

      <figure class="figure section__image">
        <img src="${p.image}" alt="">
      </figure>
    </div>
  </section>
`).join("");

// ===== modal =====
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalFrame = document.getElementById("modalFrame");
const modalNew = document.getElementById("modalNew");

const openPost = (url) => {
  modalFrame.src = url;
  modalNew.href = url;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
};
const closePost = () => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalFrame.src = "about:blank";
};

modalClose.addEventListener("click", closePost);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closePost();
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) closePost();
});
document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (!open) return;
  e.preventDefault();
  openPost(open.getAttribute("data-open"));
});

// ===== GSAP motion =====
gsap.registerPlugin(ScrollTrigger, Draggable);

const sections = gsap.utils.toArray("section");
const track = document.querySelector("[data-draggable]");
const navLinks = gsap.utils.toArray("[data-link]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const lastItemWidth = () => navLinks[navLinks.length - 1].offsetWidth;
const getUseableHeight = () => document.documentElement.offsetHeight - window.innerHeight;
const getDraggableWidth = () => ((track.offsetWidth * 0.5) - lastItemWidth());

// ScrollTrigger: scroll ↔ timeline X
const tl = gsap.timeline().to(track, {
  x: () => getDraggableWidth() * -1,
  ease: "none"
});

const st = ScrollTrigger.create({
  animation: tl,
  scrub: 0,
});

// drag timeline → scroll
const updatePosition = throttle(() => {
  const left = track.getBoundingClientRect().left * -1;
  const width = getDraggableWidth();
  const useableHeight = getUseableHeight();
  const y = gsap.utils.mapRange(0, width, 0, useableHeight, left);
  window.scrollTo({ top: y, behavior: "auto" });
}, 16);

Draggable.create(track, {
  type: "x",
  inertia: true,
  bounds: () => ({
    minX: getDraggableWidth() * -1,
    maxX: 0
  }),
  edgeResistance: 1,
  onDragStart: () => st.disable(),
  onDragEnd: () => st.enable(),
  onDrag: updatePosition,
  onThrowUpdate: updatePosition
});

// click timeline link → scroll
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-link]");
  if (!a) return;
  e.preventDefault();
  const id = a.getAttribute("href");
  const section = document.querySelector(id);
  if (!section) return;
  const y = section.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y, behavior: "smooth" });
});

// section animations + active link
const initSectionAnimation = () => {
  if (prefersReducedMotion.matches) return;

  sections.forEach((section, index) => {
    const heading = section.querySelector(".heading");
    const image = section.querySelector(".section__image");

    gsap.set(heading, { opacity: 0, y: 50 });
    gsap.set(image, { opacity: 0, rotateY: 15 });

    gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: `+=${window.innerHeight}`,
        toggleActions: "play reverse play reverse",
      }
    })
    .to(image, { opacity: 1, rotateY: -5, duration: 1.6, ease: "power3.out" })
    .to(heading, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.15);

    ScrollTrigger.create({
      trigger: section,
      start: "top 120px",   // ヘッダー + timelineぶん下げる
      end: "bottom top",
      onToggle: ({ isActive }) => {
        const link = navLinks[index];
        if (!link) return;
        link.classList.toggle("is-active", isActive);
      }
    });
  });
};

initSectionAnimation();

// keyboard nav（tabでリンクにフォーカス→そのセクションへ）
track.addEventListener("keyup", (e) => {
  const id = e.target.getAttribute("href");
  if (!id || e.key !== "Tab") return;
  const section = document.querySelector(id);
  if (!section) return;
  const y = section.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: y, behavior: "auto" });
});

// resize
window.addEventListener("resize", throttle(() => {
  ScrollTrigger.refresh();
}, 200));
