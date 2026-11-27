package com.leschenesdelaven.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReservationRequest(
        @NotBlank String chambre,
        @NotNull LocalDate debut,
        @NotNull LocalDate fin,
        String note) {
}
