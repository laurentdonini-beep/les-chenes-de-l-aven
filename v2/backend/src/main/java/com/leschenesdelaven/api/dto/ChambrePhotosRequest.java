package com.leschenesdelaven.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/** Édition des images d'une chambre depuis le BO : image principale + galerie. */
public record ChambrePhotosRequest(
        @NotBlank String image,
        List<String> photos
) {
}
