package com.leschenesdelaven.api.dto;

import com.leschenesdelaven.api.model.TarifPeriode;

import java.time.LocalDate;

public record TarifPeriodeView(
        long id,
        String chambre,   // null = toutes les chambres
        LocalDate debut,
        LocalDate fin,
        int prix1,
        int prix2,
        String label) {

    public static TarifPeriodeView of(TarifPeriode t) {
        return new TarifPeriodeView(t.getId(), t.getChambre(), t.getDebut(), t.getFin(),
                t.getPrix1(), t.getPrix2(), t.getLabel());
    }
}
