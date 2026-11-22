(function () {
  const IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  let reservations = [];
  try { reservations = JSON.parse(document.getElementById("dispo-data").textContent).reservations || []; } catch (e) {}
  let jwt = null;

  const listEl = document.getElementById("bo-list");
  const statusEl = document.getElementById("bo-status");
  const selectEl = document.getElementById("bo-chambre");

  function roomLabel(slug) {
    const o = Array.from(selectEl.options).find((o) => o.value === slug);
    return o ? o.textContent : slug;
  }
  function fmt(d) { const p = String(d).slice(0, 10).split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : d; }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  function render() {
    listEl.innerHTML = "";
    if (!reservations.length) {
      const p = document.createElement("p");
      p.className = "bo-note";
      p.textContent = "Aucune réservation pour l'instant — toutes les chambres sont libres.";
      listEl.appendChild(p);
      return;
    }
    reservations.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "dispo-row";
      const span = document.createElement("span");
      span.innerHTML = "<strong>" + esc(roomLabel(r.chambre)) + "</strong> — du " + fmt(r.du) + " au " + fmt(r.au) + (r.note ? " <em>(" + esc(r.note) + ")</em>" : "");
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn btn-outline btn-small";
      del.textContent = "Supprimer";
      del.addEventListener("click", () => { reservations.splice(i, 1); render(); });
      row.appendChild(span); row.appendChild(del);
      listEl.appendChild(row);
    });
  }

  document.getElementById("bo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const chambre = selectEl.value;
    const du = document.getElementById("bo-du").value;
    const au = document.getElementById("bo-au").value;
    const note = document.getElementById("bo-note").value.trim();
    if (!du || !au || du > au) { statusEl.textContent = "Vérifiez les dates (le « du » doit être avant le « au »)."; return; }
    const r = { chambre, du, au };
    if (note) r.note = note;
    reservations.push(r);
    reservations.sort((a, b) => String(a.du).localeCompare(String(b.du)));
    e.target.reset();
    render();
    statusEl.textContent = "Période ajoutée — cliquez sur « Enregistrer et publier ».";
  });

  async function save() {
    statusEl.textContent = "Enregistrement…";
    try {
      if (IS_LOCAL) {
        const api = "http://" + location.hostname + ":8081/api/v1";
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "persistEntry",
            params: {
              branch: "main",
              dataFiles: [{ path: "src/_data/disponibilites.json", slug: "dispos", raw: JSON.stringify({ reservations }, null, 2) + "\n" }],
              assets: [],
              options: { collectionName: "disponibilites", commitMessage: "Mise à jour des disponibilités (backoffice /bo)", useWorkflow: false, status: "published" }
            }
          })
        });
        if (!res.ok) throw new Error((await res.text()) || res.status);
        statusEl.textContent = "✔ Enregistré dans le dépôt local — faites Commit + Push dans GitHub Desktop, le site se met à jour (Ctrl+F5).";
      } else {
        if (!jwt) throw new Error("connectez-vous d'abord");
        const res = await fetch("/.netlify/functions/dispo", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + jwt },
          body: JSON.stringify({ reservations })
        });
        const txt = await res.text();
        if (!res.ok) throw new Error(txt || res.status);
        statusEl.textContent = "✔ Publié — le site sera mis à jour au prochain déploiement (quelques secondes). Rafraîchissez la page pour recharger la liste.";
      }
    } catch (err) {
      statusEl.textContent = "Erreur : " + (err.message || err);
    }
  }
  document.getElementById("bo-save").addEventListener("click", save);

  const app = document.getElementById("bo-app");
  const loginBox = document.getElementById("bo-login");
  if (IS_LOCAL) {
    app.style.display = "block";
    render();
  } else {
    const s = document.createElement("script");
    s.src = "/admin/vendor/netlify-identity-widget.js";
    s.onload = () => {
      window.netlifyIdentity.init();
      const show = () => { app.style.display = "block"; render(); };
      const user = window.netlifyIdentity.currentUser();
      if (user) { jwt = user.jwt(); show(); return; }
      loginBox.style.display = "block";
      document.getElementById("bo-login-btn").addEventListener("click", async () => {
        try {
          const u = await window.netlifyIdentity.login(
            document.getElementById("bo-email").value,
            document.getElementById("bo-pass").value,
            true
          );
          jwt = u.jwt();
          loginBox.style.display = "none";
          show();
        } catch (e) {
          document.getElementById("bo-login-err").textContent = (e && e.message) || "Connexion impossible";
        }
      });
    };
    document.head.appendChild(s);
  }
})();
