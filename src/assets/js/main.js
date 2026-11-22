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

// Galerie "best grid" (style Modula) : rangees de hauteur egale, bas aligne
let imgSizes = null;
function layoutGalleries() {
  const gap = window.innerWidth <= 640 ? 8 : 12;
  document.querySelectorAll(".gallery-grid").forEach((grid) => {
    grid.querySelectorAll(".g-row").forEach((row) => {
      while (row.firstChild) grid.appendChild(row.firstChild);
      row.remove();
    });
    const imgs = Array.from(grid.querySelectorAll("img"));
    if (!imgs.length) return;
    const W = grid.clientWidth;
    if (!W) return;
    const targetH = Math.max(160, Math.min(300, W / 3));
    const items = imgs.map((im) => {
      const src = im.getAttribute("src") || "";
      const key = src.replace(/^\/assets\/img\//, "").split("?")[0];
      const s = (imgSizes && imgSizes[key]) || (im.naturalWidth ? [im.naturalWidth, im.naturalHeight] : null);
      return { im, a: s && s[1] ? s[0] / s[1] : 1 };
    });
    let row = [], rowA = 0;
    const flush = (isLast) => {
      if (!row.length) return;
      let h = (W - gap * (row.length - 1)) / rowA;
      let stretch = false;
      if (isLast && h > targetH) { h = targetH; stretch = true; }
      const div = document.createElement("div");
      div.className = "g-row";
      div.style.height = h + "px";
      row.forEach((it) => {
        it.im.style.height = "100%";
        it.im.style.objectFit = "cover";
        if (stretch) {
          it.im.style.width = "auto";
          it.im.style.flex = it.a + " 1 0px";
        } else {
          it.im.style.width = Math.round(it.a * h) + "px";
          it.im.style.flex = "0 1 auto";
        }
        div.appendChild(it.im);
      });
      grid.appendChild(div);
      row = []; rowA = 0;
    };
    items.forEach((it, i) => {
      row.push(it); rowA += it.a;
      if (rowA * targetH + gap * (row.length - 1) >= W || i === items.length - 1) flush(i === items.length - 1);
    });
  });
}
fetch("/assets/js/img-sizes.json")
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => { imgSizes = j; layoutGalleries(); })
  .catch(() => layoutGalleries());
let galResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(galResizeTimer);
  galResizeTimer = setTimeout(layoutGalleries, 150);
});
window.addEventListener("load", layoutGalleries);

// Calendrier des disponibilites : 4 mois visibles, boutons precedent/suivant
(function () {
  const dataEl = document.getElementById("dispo-data");
  if (!dataEl) return;
  let reservations = [];
  try { reservations = JSON.parse(dataEl.textContent).reservations || []; } catch (e) { return; }
  const byRoom = {};
  reservations.forEach((r) => {
    if (!r.chambre || !r.du || !r.au) return;
    (byRoom[r.chambre] = byRoom[r.chambre] || []).push(r);
  });
  const monthsFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const daysFR = ["lu","ma","me","je","ve","sa","di"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const NB_MOIS = 2, MAX_OFFSET = 24;
  function bookedOn(room, y, m, d) {
    const t = new Date(y, m, d).getTime();
    return (byRoom[room] || []).some((r) => {
      const a = new Date(r.du + "T00:00:00").getTime();
      const b = new Date(r.au + "T23:59:59").getTime();
      return t >= a && t <= b;
    });
  }
  function monthBlock(room, y, m) {
    const monthDiv = document.createElement("div");
    monthDiv.className = "cal-month";
    const h = document.createElement("h4");
    h.textContent = monthsFR[m] + " " + y;
    monthDiv.appendChild(h);
    const grid = document.createElement("div");
    grid.className = "cal-grid";
    daysFR.forEach((w) => {
      const c = document.createElement("span");
      c.className = "cal-dow"; c.textContent = w;
      grid.appendChild(c);
    });
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    for (let k = 0; k < offset; k++) grid.appendChild(document.createElement("span"));
    const nbDays = new Date(y, m + 1, 0).getDate();
    for (let day = 1; day <= nbDays; day++) {
      const cell = document.createElement("span");
      cell.className = "cal-day";
      cell.textContent = day;
      const dt = new Date(y, m, day);
      if (dt < today) cell.classList.add("past");
      if (dt.getTime() === today.getTime()) cell.classList.add("today");
      if (bookedOn(room, y, m, day)) cell.classList.add("booked");
      grid.appendChild(cell);
    }
    monthDiv.appendChild(grid);
    return monthDiv;
  }
  document.querySelectorAll(".cal").forEach((cal) => {
    const room = cal.dataset.room;
    let offset = 0;
    const controls = document.createElement("div");
    controls.className = "cal-controls";
    const prev = document.createElement("button");
    prev.type = "button"; prev.className = "cal-nav"; prev.textContent = "‹"; prev.setAttribute("aria-label", "Mois précédents");
    const next = document.createElement("button");
    next.type = "button"; next.className = "cal-nav"; next.textContent = "›"; next.setAttribute("aria-label", "Mois suivants");
    controls.appendChild(prev); controls.appendChild(next);
    const monthsWrap = document.createElement("div");
    monthsWrap.className = "cal-months";
    cal.appendChild(controls);
    cal.appendChild(monthsWrap);
    function render() {
      monthsWrap.innerHTML = "";
      const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      for (let i = 0; i < NB_MOIS; i++) {
        const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
        monthsWrap.appendChild(monthBlock(room, d.getFullYear(), d.getMonth()));
      }
      prev.disabled = offset <= 0;
      next.disabled = offset >= MAX_OFFSET;
    }
    prev.addEventListener("click", () => { if (offset > 0) { offset--; render(); } });
    next.addEventListener("click", () => { if (offset < MAX_OFFSET) { offset++; render(); } });
    render();
  });
})();
