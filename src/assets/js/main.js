document.getElementById("year").textContent = new Date().getFullYear();

const toggle = document.getElementById("nav-toggle");
const nav = document.getElementById("main-nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => nav.classList.remove("open"))
);

const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
// filet de sécurité : tout rendre visible même si l'observer ne se déclenche pas
setTimeout(() => {
  document.querySelectorAll(".reveal:not(.visible)").forEach((el) => el.classList.add("visible"));
}, 1500);

const chambres = [
  "Marron Glacé",
  "Chêne Vert",
  "Pitchouline",
  "Petite-Lauze"
];
const select = document.getElementById("chambre-select");
if (select) {
  chambres.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  const param = new URLSearchParams(location.search).get("chambre");
  if (param) select.value = param;
}

const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = new FormData(form);
    const lignes = [
      "Nom : " + d.get("nom"),
      "Email : " + d.get("email"),
      "Téléphone : " + (d.get("telephone") || "—"),
      "Arrivée souhaitée : " + (d.get("arrivee") || "—"),
      "Départ souhaité : " + (d.get("depart") || "—"),
      "Chambre souhaitée : " + (d.get("chambre") || "Peu importe"),
      "",
      d.get("message")
    ];
    const sujet = "Demande de réservation — Les Chênes de l'Aven";
    const mailto =
      "mailto:contact@leschenesdelaven.fr?subject=" +
      encodeURIComponent(sujet) +
      "&body=" +
      encodeURIComponent(lignes.join("\n"));
    window.location.href = mailto;
  });
}

// Lightbox : clic sur une photo de la page -> plein ecran, fleches/clavier/swipe pour defiler
const lightbox = document.getElementById("lightbox");
if (lightbox) {
  const lbImg = document.getElementById("lightbox-img");
  const lbCap = document.getElementById("lightbox-caption");
  const lbCount = document.getElementById("lightbox-counter");
  const imgs = Array.from(document.querySelectorAll("main img")).filter(
    (img) => img.src && !img.closest("a") && !img.classList.contains("hero-img")
  );
  imgs.forEach((img) => img.classList.add("zoomable"));
  let idx = 0;
  function show(i) {
    if (!imgs.length) return;
    idx = (i + imgs.length) % imgs.length;
    const img = imgs[idx];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || "";
    lbCap.textContent = img.alt || "";
    lbCount.textContent = (idx + 1) + " / " + imgs.length;
  }
  function open(i) {
    show(i);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.src = "";
  }
  imgs.forEach((img, i) => img.addEventListener("click", () => open(i)));
  document.getElementById("lightbox-close").addEventListener("click", close);
  document.getElementById("lightbox-prev").addEventListener("click", () => show(idx - 1));
  document.getElementById("lightbox-next").addEventListener("click", () => show(idx + 1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let touchX = null;
  lightbox.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  });
}

// Carrousel du hero : défilement auto 5s, flèches, points, pause au survol
const heroSlider = document.getElementById("hero-slider");
if (heroSlider) {
  const slides = Array.from(heroSlider.querySelectorAll(".hero-img"));
  const dotsWrap = document.getElementById("hero-dots");
  let cur = 0;
  let timer = null;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Photo " + (i + 1));
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", () => { go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);
  function go(i) {
    slides[cur].classList.remove("active");
    dots[cur].classList.remove("active");
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add("active");
    dots[cur].classList.add("active");
  }
  const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function restart() {
    clearInterval(timer);
    if (reduceMotion) return;
    timer = setInterval(() => go(cur + 1), 6000);
  }
  document.getElementById("hero-prev").addEventListener("click", () => { go(cur - 1); restart(); });
  document.getElementById("hero-next").addEventListener("click", () => { go(cur + 1); restart(); });
  heroSlider.addEventListener("mouseenter", () => clearInterval(timer));
  heroSlider.addEventListener("mouseleave", restart);
  restart();
}
