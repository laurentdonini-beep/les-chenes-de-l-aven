package com.leschenesdelaven.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank String nom,
        @NotBlank @Email String email,
        String tel,
        String chambre,
        String arrivee,
        String depart,
        @NotBlank @Size(max = 5000) String message) {
}
