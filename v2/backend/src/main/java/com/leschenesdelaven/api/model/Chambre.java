package com.leschenesdelaven.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "chambres")
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String titre;

    /** "ordre" est un mot réservé SQL : on nomme la colonne autrement. */
    @Column(name = "ordre_tri", nullable = false)
    private int ordre;

    private String surface;
    private String capacite;

    @Column(length = 2000)
    private String resume;

    private String image;

    /** Contenu de la page chambre, pré-rendu en HTML. */
    @Lob
    @Column(columnDefinition = "CLOB")
    private String contenu;

    /** Liste des équipements, sérialisée en JSON. */
    @Lob
    @Column(columnDefinition = "CLOB")
    private String equipements;

    /** Photos de la galerie de la chambre, sérialisées en JSON. */
    @Lob
    @Column(columnDefinition = "CLOB")
    private String photos;

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public int getOrdre() { return ordre; }
    public void setOrdre(int ordre) { this.ordre = ordre; }
    public String getSurface() { return surface; }
    public void setSurface(String surface) { this.surface = surface; }
    public String getCapacite() { return capacite; }
    public void setCapacite(String capacite) { this.capacite = capacite; }
    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
    public String getEquipements() { return equipements; }
    public void setEquipements(String equipements) { this.equipements = equipements; }
    public String getPhotos() { return photos; }
    public void setPhotos(String photos) { this.photos = photos; }
}
