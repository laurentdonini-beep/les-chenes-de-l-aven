package com.leschenesdelaven.api.dto;

import com.leschenesdelaven.api.model.Message;

import java.time.LocalDateTime;

public record MessageView(
        long id,
        String nom,
        String email,
        String tel,
        String chambre,
        String arrivee,
        String depart,
        String message,
        LocalDateTime createdAt,
        boolean mailEnvoye,
        boolean traite) {

    public static MessageView of(Message m) {
        return new MessageView(m.getId(), m.getNom(), m.getEmail(), m.getTel(), m.getChambre(),
                m.getArrivee(), m.getDepart(), m.getMessage(), m.getCreatedAt(), m.isMailEnvoye(),
                m.getTraite() != null && m.getTraite());
    }
}
