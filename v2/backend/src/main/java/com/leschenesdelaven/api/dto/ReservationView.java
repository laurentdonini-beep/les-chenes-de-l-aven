package com.leschenesdelaven.api.dto;

import com.leschenesdelaven.api.model.Reservation;

import java.time.LocalDate;

public record ReservationView(
        long id,
        String chambre,
        LocalDate debut,
        LocalDate fin,
        String note) {

    public static ReservationView of(Reservation r) {
        return new ReservationView(r.getId(), r.getChambre(), r.getDebut(), r.getFin(), r.getNote());
    }
}
