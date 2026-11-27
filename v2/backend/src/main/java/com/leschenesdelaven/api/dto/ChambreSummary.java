package com.leschenesdelaven.api.dto;

import com.leschenesdelaven.api.model.Chambre;

public record ChambreSummary(
        String slug,
        String titre,
        int ordre,
        String surface,
        String capacite,
        String resume,
        String image) {

    public static ChambreSummary of(Chambre c) {
        return new ChambreSummary(c.getSlug(), c.getTitre(), c.getOrdre(),
                c.getSurface(), c.getCapacite(), c.getResume(), c.getImage());
    }
}
