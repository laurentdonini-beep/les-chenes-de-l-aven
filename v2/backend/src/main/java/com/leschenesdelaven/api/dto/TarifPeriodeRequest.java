package com.leschenesdelaven.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record TarifPeriodeRequest(
        String chambre,   // null ou vide = toutes les chambres
        @NotNull LocalDate debut,
        @NotNull LocalDate fin,
        @NotNull @Positive Integer prix1,
        @NotNull @Positive Integer prix2,
        @NotBlank String label) {
}
