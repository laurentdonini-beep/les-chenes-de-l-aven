package com.leschenesdelaven.api.dto;

/**
 * Une image du site vue depuis le backoffice.
 * source : "site" (fournie avec le site), "remplacee" (remplacée depuis le BO, même URL),
 *          "upload" (uploadée dans /uploads/...).
 */
public record MediaView(String path, String name, long size, String source) {
}
