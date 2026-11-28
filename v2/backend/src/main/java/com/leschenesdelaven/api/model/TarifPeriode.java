package com.leschenesdelaven.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

/**
 * Période tarifaire (haute saison, promo…) : prix spéciaux du debut au fin inclus.
 * chambre = null -> s'applique à TOUTES les chambres.
 */
@Entity
@Table(name = "tarifs_periodes")
public class TarifPeriode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chambre")
    private String chambre;

    @Column(nullable = false)
    private LocalDate debut;

    @Column(nullable = false)
    private LocalDate fin;

    @Column(nullable = false)
    private int prix1;

    @Column(nullable = false)
    private int prix2;

    @Column(nullable = false)
    private String label;

    public Long getId() { return id; }
    public String getChambre() { return chambre; }
    public void setChambre(String chambre) { this.chambre = chambre; }
    public LocalDate getDebut() { return debut; }
    public void setDebut(LocalDate debut) { this.debut = debut; }
    public LocalDate getFin() { return fin; }
    public void setFin(LocalDate fin) { this.fin = fin; }
    public int getPrix1() { return prix1; }
    public void setPrix1(int prix1) { this.prix1 = prix1; }
    public int getPrix2() { return prix2; }
    public void setPrix2(int prix2) { this.prix2 = prix2; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
