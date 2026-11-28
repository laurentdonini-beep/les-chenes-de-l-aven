package com.leschenesdelaven.api.dto;

import jakarta.validation.constraints.Positive;

/** Prix de base d'une chambre (null = hériter des tarifs généraux du site). */
public record ChambreTarifsRequest(
        @Positive Integer tarif1,
        @Positive Integer tarif2) {
}
