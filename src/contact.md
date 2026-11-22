---
layout: base.njk
title: Contact & réservation
description: Contactez Les Chênes de l'Aven à Orgnac-l'Aven pour réserver votre chambre d'hôtes — téléphone, email, formulaire et plan d'accès.
---
<section class="page-hero container">
  <p class="hero-kicker">Contact & réservation</p>
  <h1>Nous contacter</h1>
  <p class="lead">{{ site.ouverture }}</p>
</section>

<section class="section container contact-top">
  <div class="grid-2 contact-grid">
    <div class="card reveal">
      <h2>Coordonnées</h2>
      <p class="contact-lines">
        <strong>{{ site.hote }}</strong><br>
        {{ site.adresseLignes | join("<br>") | safe }}
      </p>
      <p>
        <a href="tel:{{ site.telHref }}" class="btn">{{ site.tel }}</a>
      </p>
      <p><a href="mailto:{{ site.email }}" class="link-arrow">{{ site.email }}</a></p>
      <div class="social-links social-lg">
        <a href="{{ site.facebook }}" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>
        </a>
        <a href="{{ site.instagram }}" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>
        </a>
      </div>
      <h2 style="margin-top:1.4rem;">Comment réserver ?</h2>
      <p>Envoyez-nous un message (formulaire ci-contre, email ou téléphone) avec vos dates souhaitées et la chambre désirée. Nous vous répondons par mail pour formaliser la réservation : 30 % d'acompte pour bloquer le séjour (min. 2 nuits), solde à l'arrivée.</p>
    </div>

    <div class="card reveal">
      <h2>Formulaire de demande</h2>
      <form id="contact-form" novalidate>
        <label>Nom *
          <input type="text" name="nom" required>
        </label>
        <label>Email *
          <input type="email" name="email" required>
        </label>
        <label>Téléphone
          <input type="tel" name="telephone">
        </label>
        <div class="form-row">
          <label>Arrivée souhaitée
            <input type="date" name="arrivee">
          </label>
          <label>Départ souhaité
            <input type="date" name="depart">
          </label>
        </div>
        <label>Chambre souhaitée
          <select name="chambre" id="chambre-select">
            <option value="">Peu importe</option>
          </select>
        </label>
        <label>Message *
          <textarea name="message" rows="4" required placeholder="Vos dates, le nombre de personnes, vos questions…"></textarea>
        </label>
        <button type="submit" class="btn btn-block">Envoyer la demande</button>
        <p class="form-note">Le formulaire ouvre votre messagerie avec un email pré-rempli adressé à {{ site.email }} — aucune donnée n'est envoyée à un service tiers.</p>
      </form>
    </div>
  </div>
</section>

<section class="section container" style="padding-top: 1rem;">
  <h2 class="section-title reveal">Plan d'accès</h2>
  <div class="split map-split reveal">
    <div class="map-wrap">
      <iframe title="Plan d'accès — Les Chênes de l'Aven" src="https://www.openstreetmap.org/export/embed.html?bbox=4.34%2C44.32%2C4.41%2C44.38&amp;layer=mapnik&amp;marker=44.3523%2C4.3729" loading="lazy"></iframe>
    </div>
    <div class="card">
      <h2>Venir chez nous</h2>
      <p class="contact-lines">{{ site.adresseLignes | join("<br>") | safe }}</p>
      <p>{{ site.ouverture }} — réservation à partir de 2 nuits.</p>
      <p>
        <a class="pill" href="https://www.openstreetmap.org/?mlat=44.3523&amp;mlon=4.3729#map=14/44.3523/4.3729" target="_blank" rel="noopener">Ouvrir dans OpenStreetMap</a>
        <a class="pill" href="https://www.google.com/maps/dir/?api=1&amp;destination=44.3523,4.3729" target="_blank" rel="noopener">Itinéraire Google Maps</a>
      </p>
    </div>
  </div>
</section>
