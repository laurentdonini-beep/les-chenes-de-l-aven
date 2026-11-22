---
layout: base.njk
title: Contact & réservation
description: Contactez Les Chênes de l'Aven à Orgnac-l'Aven pour réserver votre chambre d'hôtes — téléphone, email, formulaire et plan d'accès.
---
<section class="page-hero container">
  <p class="hero-kicker">Contact & réservation</p>
  <h1>Réserver votre séjour</h1>
  <p class="lead">{{ site.ouverture }} — réponse par mail sous 24–48 h.</p>
</section>

<section class="section container contact-top">
  <div class="grid-3">
    <div class="card contact-strip-card reveal">
      <span class="service-icon">📞</span>
      <h3>Appeler</h3>
      <p><a href="tel:{{ site.telHref }}" class="btn btn-outline">{{ site.tel }}</a></p>
    </div>
    <div class="card contact-strip-card reveal">
      <span class="service-icon">✉️</span>
      <h3>Écrire</h3>
      <p><a href="mailto:{{ site.email }}" class="btn btn-outline">{{ site.email }}</a></p>
    </div>
    <div class="card contact-strip-card reveal">
      <span class="service-icon">📍</span>
      <h3>Adresse</h3>
      <p class="contact-lines">{{ site.adresseLignes | join("<br>") | safe }}</p>
      <div class="social-links social-lg" style="justify-content:center; margin-top:0.6rem;">
        <a href="{{ site.facebook }}" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
        </a>
        <a href="{{ site.instagram }}" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="section container" style="padding-top: 0.5rem;">
  <h2 class="section-title reveal">Demander une réservation</h2>
  <p class="center reveal" style="margin-top: -0.5rem;">Réponse sous 24–48 h · acompte 30 % pour bloquer le séjour (min. 2 nuits) · solde à l'arrivée.</p>

  <div class="form-wrap reveal">
    <div class="card">
      <form id="contact-form" novalidate>
        <div class="form-row">
          <label>Nom *
            <input type="text" name="nom" required>
          </label>
          <label>Email *
            <input type="email" name="email" required>
          </label>
        </div>
        <div class="form-row">
          <label>Téléphone
            <input type="tel" name="telephone">
          </label>
          <label>Chambre souhaitée
            <select name="chambre" id="chambre-select">
              <option value="">Peu importe</option>
            </select>
          </label>
        </div>
        <div class="form-row">
          <label>Arrivée souhaitée
            <input type="date" name="arrivee">
          </label>
          <label>Départ souhaité
            <input type="date" name="depart">
          </label>
        </div>
        <label>Message *
          <textarea name="message" rows="4" required placeholder="Vos dates, le nombre de personnes, vos questions…"></textarea>
        </label>
        <button type="submit" class="btn btn-block">Envoyer la demande</button>
        <p class="form-note">Le formulaire ouvre votre messagerie avec un email pré-rempli adressé à {{ site.email }} — aucune donnée n'est envoyée à un service tiers.</p>
      </form>
    </div>
  </div>
</section>

<section class="section container" style="padding-top: 0.5rem;">
  <h2 class="section-title reveal">Plan d'accès</h2>
  <div class="map-wrap reveal">
    <iframe title="Plan d'accès — Les Chênes de l'Aven" src="https://www.openstreetmap.org/export/embed.html?bbox=4.34%2C44.32%2C4.41%2C44.38&amp;layer=mapnik&amp;marker=44.3523%2C4.3729" loading="lazy"></iframe>
  </div>
  <p class="center reveal" style="margin-top: 1rem;">
    <a class="pill" href="https://www.openstreetmap.org/?mlat=44.3523&amp;mlon=4.3729#map=14/44.3523/4.3729" target="_blank" rel="noopener">Ouvrir dans OpenStreetMap</a>
    <a class="pill" href="https://www.google.com/maps/dir/?api=1&amp;destination=44.3523,4.3729" target="_blank" rel="noopener">Itinéraire Google Maps</a>
  </p>
</section>
