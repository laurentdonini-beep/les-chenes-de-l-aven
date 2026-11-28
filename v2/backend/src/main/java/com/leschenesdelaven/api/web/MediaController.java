package com.leschenesdelaven.api.web;

import com.leschenesdelaven.api.dto.MediaView;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

/**
 * Gestion des images du site depuis le backoffice (/bo/photos) — session admin requise :
 * - GET    /api/admin/media            : liste toutes les images (site + uploads + remplacées)
 * - POST   /api/admin/media/upload     : upload (multipart "file") ; avec "targetPath=/assets/img/..."
 *                                        remplace une image du site à la MÊME URL
 * - DELETE /api/admin/media?path=...   : supprime un upload, ou annule un remplacement
 *                                        (les images fournies avec le site ne sont pas supprimables)
 */
@RestController
@RequestMapping("/api/admin/media")
public class MediaController {

    private static final Set<String> EXT_OK = Set.of("jpg", "jpeg", "png", "webp", "gif", "avif", "svg");
    private static final long MAX_SIZE = 20L * 1024 * 1024;

    private final Path uploadsDir;
    private final Path frontendImgDir;

    public MediaController(@Value("${app.frontend-dir}") String frontendDir,
                           @Value("${app.uploads-dir}") String uploadsDir) {
        this.uploadsDir = Paths.get(uploadsDir).toAbsolutePath().normalize();
        this.frontendImgDir = Paths.get(frontendDir).toAbsolutePath().normalize().resolve("assets/img");
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(uploadsDir);
    }

    @GetMapping
    public List<MediaView> list() throws IOException {
        List<MediaView> out = new ArrayList<>();
        // 1) images fournies avec le site (build Angular)
        if (Files.isDirectory(frontendImgDir)) {
            try (Stream<Path> walk = Files.walk(frontendImgDir)) {
                walk.filter(Files::isRegularFile)
                        .filter(p -> isImage(p.getFileName().toString()))
                        .forEach(p -> {
                            String rel = frontendImgDir.relativize(p).toString().replace('\\', '/');
                            boolean remplacee = Files.isRegularFile(shadowOf("/assets/img/" + rel));
                            out.add(new MediaView("/assets/img/" + rel, p.getFileName().toString(),
                                    size(p), remplacee ? "remplacee" : "site"));
                        });
            }
        }
        // 2) photos uploadées dans /uploads (hors sous-dossier assets/img = shadows déjà listés)
        if (Files.isDirectory(uploadsDir)) {
            try (Stream<Path> walk = Files.walk(uploadsDir)) {
                walk.filter(Files::isRegularFile)
                        .filter(p -> isImage(p.getFileName().toString()))
                        .filter(p -> {
                            String rel = uploadsDir.relativize(p).toString().replace('\\', '/');
                            return !rel.startsWith("assets/");
                        })
                        .forEach(p -> {
                            String rel = uploadsDir.relativize(p).toString().replace('\\', '/');
                            out.add(new MediaView("/uploads/" + rel, p.getFileName().toString(),
                                    size(p), "upload"));
                        });
            }
        }
        out.sort(Comparator.comparing(MediaView::path));
        return out;
    }

    /** Upload une photo. Si targetPath=/assets/img/... est fourni, remplace l'image du site (même URL). */
    @PostMapping("/upload")
    public MediaView upload(@RequestParam("file") MultipartFile file,
                            @RequestParam(value = "targetPath", required = false) String targetPath) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aucun fichier reçu");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier trop volumineux (max 20 Mo)");
        }
        String orig = file.getOriginalFilename() == null ? "photo.jpg" : file.getOriginalFilename();
        String ext = extension(orig);
        if (!EXT_OK.contains(ext)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Format non autorisé (" + ext + ") — JPG, PNG, WebP, GIF, AVIF, SVG uniquement");
        }

        Path dest;
        String url;
        if (targetPath != null && !targetPath.isBlank()) {
            // Remplacement d'une image du site : on écrit le "shadow" dans uploads, servi à la même URL
            if (!targetPath.startsWith("/assets/img/") || targetPath.contains("..")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin de remplacement invalide");
            }
            dest = uploadsDir.resolve(targetPath.substring(1)).normalize();
            if (!dest.startsWith(uploadsDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin de remplacement invalide");
            }
            url = targetPath;
        } else {
            String clean = sanitize(orig);
            dest = uniqueDest(uploadsDir.resolve(clean));
            url = "/uploads/" + dest.getFileName();
        }
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return new MediaView(url, dest.getFileName().toString(), Files.size(dest),
                targetPath != null && !targetPath.isBlank() ? "remplacee" : "upload");
    }

    /** Supprime un upload, ou annule un remplacement (retour à l'image fournie avec le site). */
    @DeleteMapping
    public Map<String, Object> delete(@RequestParam("path") String path) throws IOException {
        if (path == null || path.contains("..")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin invalide");
        }
        if (path.startsWith("/uploads/")) {
            Path p = uploadsDir.resolve(path.substring("/uploads/".length())).normalize();
            if (!p.startsWith(uploadsDir) || !Files.isRegularFile(p)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable : " + path);
            }
            Files.delete(p);
            return Map.of("ok", true, "path", path);
        }
        if (path.startsWith("/assets/img/")) {
            Path shadow = shadowOf(path);
            if (!Files.isRegularFile(shadow)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Image fournie avec le site : on ne peut pas la supprimer (vous pouvez la remplacer, ou la retirer des pages)");
            }
            Files.delete(shadow);
            return Map.of("ok", true, "path", path, "reverted", true);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seuls /uploads/** et /assets/img/** sont gérés");
    }

    // ---------- utilitaires ----------

    private Path shadowOf(String urlPath) {
        return uploadsDir.resolve(urlPath.substring(1)).normalize();
    }

    private static String extension(String name) {
        int i = name.lastIndexOf('.');
        return i < 0 ? "" : name.substring(i + 1).toLowerCase();
    }

    private static boolean isImage(String name) {
        return EXT_OK.contains(extension(name));
    }

    private static String sanitize(String name) {
        String base = Paths.get(name).getFileName().toString(); // enlève tout chemin
        base = base.replaceAll("[^a-zA-Z0-9._-]", "-").replaceAll("-{2,}", "-");
        if (base.isBlank() || base.startsWith(".")) base = "photo.jpg";
        return base;
    }

    private static Path uniqueDest(Path dest) throws IOException {
        if (!Files.exists(dest)) return dest;
        String name = dest.getFileName().toString();
        String base = name.contains(".") ? name.substring(0, name.lastIndexOf('.')) : name;
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.')) : "";
        for (int i = 2; i < 1000; i++) {
            Path candidate = dest.getParent().resolve(base + "-" + i + ext);
            if (!Files.exists(candidate)) return candidate;
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Nom de fichier saturé");
    }

    private static long size(Path p) {
        try {
            return Files.size(p);
        } catch (IOException e) {
            return 0;
        }
    }
}
