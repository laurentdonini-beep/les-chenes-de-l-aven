package com.leschenesdelaven.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/** Message envoyé via le formulaire de contact. */
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String email;

    private String tel;
    private String chambre;
    private String arrivee;
    private String depart;

    @Lob
    @Column(nullable = false, columnDefinition = "CLOB")
    private String message;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean mailEnvoye = false;

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }
    public String getChambre() { return chambre; }
    public void setChambre(String chambre) { this.chambre = chambre; }
    public String getArrivee() { return arrivee; }
    public void setArrivee(String arrivee) { this.arrivee = arrivee; }
    public String getDepart() { return depart; }
    public void setDepart(String depart) { this.depart = depart; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isMailEnvoye() { return mailEnvoye; }
    public void setMailEnvoye(boolean mailEnvoye) { this.mailEnvoye = mailEnvoye; }
}
