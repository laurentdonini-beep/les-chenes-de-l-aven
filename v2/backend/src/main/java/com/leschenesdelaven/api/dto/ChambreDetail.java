package com.leschenesdelaven.api.dto;

import java.util.List;

public record ChambreDetail(
        String slug,
        String titre,
        int ordre,
        String surface,
        String capacite,
        String resume,
        String image,
        String contenu,          // HTML pré-rendu
        List<String> equipements,
        List<String> photos) {
}
