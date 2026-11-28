package com.leschenesdelaven.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Sert les images gérées depuis le backoffice :
 * - /uploads/**            : photos uploadées depuis le BO (dossier persistant data/uploads)
 * - /assets/img/**        : une image "remplacée" depuis le BO (data/uploads/assets/img/...)
 *                           masque celle du build Angular, à la MÊME URL (les pages du site
 *                           continuent de fonctionner sans aucun changement de contenu).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String frontendDir;
    private final String uploadsDir;

    public WebConfig(@Value("${app.frontend-dir}") String frontendDir,
                     @Value("${app.uploads-dir}") String uploadsDir) {
        this.frontendDir = Paths.get(frontendDir).toAbsolutePath().normalize().toString();
        this.uploadsDir = Paths.get(uploadsDir).toAbsolutePath().normalize().toString();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsDir + "/");
        registry.addResourceHandler("/assets/img/**")
                .addResourceLocations("file:" + uploadsDir + "/assets/img/",
                        "file:" + frontendDir + "/assets/img/");
    }
}
