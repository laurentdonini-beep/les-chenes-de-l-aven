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

<section class="section container">
  <div class="grid-2 contact-grid">
    <div class="card reveal">
      <h2>Coordonnées</h2>
      <p class="contact-lines">
        <strong>{{ site.hote }}</strong><br>
        {{ site.adresseLignes | join("<br>") | safe }}
      </p>
      <p>
        <a href="tel:{{ site.telHref }}" class="btn btn-outline">{{ site.tel }}</a>
      </p>
      <p><a href="mailto:{{ site.email }}" class="link-arrow">{{ site.email }}</a></p>
      <h2>Comment réserver ?</h2>
      <p>Envoyez-nous un message (formulaire ci-contre, email ou téléphone) avec vos dates souhaitées. Nous vous répondons par mail pour formaliser la réservation : 30 % d'acompte demandés pour bloquer le séjour, solde à l'arrivée.</p>
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

<section class="section container">
  <h2 class="section-title reveal">Plan d'accès</h2>
  <div class="map-wrap reveal">
    <iframe title="Plan d'accès — Les Chênes de l'Aven" src="https://www.openstreetmap.org/export/embed.html?bbox=4.34%2C44.32%2C4.41%2C44.38&amp;layer=mapnik&amp;marker=44.3523%2C4.3729" loading="lazy"></iframe>
  </div>
</section>
