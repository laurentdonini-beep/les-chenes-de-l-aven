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
