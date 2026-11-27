package com.leschenesdelaven.api.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leschenesdelaven.api.model.Chambre;
import com.leschenesdelaven.api.model.Reservation;
import com.leschenesdelaven.api.model.SiteParams;
import com.leschenesdelaven.api.repo.ChambreRepository;
import com.leschenesdelaven.api.repo.ReservationRepository;
import com.leschenesdelaven.api.repo.SiteParamsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

/**
 * Au premier démarrage (base vide), charge le contenu du site actuel
 * (seed/site.json, seed/chambres.json, seed/disponibilites.json générés
 * depuis l'ancien site Eleventy).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final SiteParamsRepository siteParamsRepository;
    private final ChambreRepository chambreRepository;
    private final ReservationRepository reservationRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(SiteParamsRepository siteParamsRepository,
                      ChambreRepository chambreRepository,
                      ReservationRepository reservationRepository,
                      ObjectMapper objectMapper) {
        this.siteParamsRepository = siteParamsRepository;
        this.chambreRepository = chambreRepository;
        this.reservationRepository = reservationRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (siteParamsRepository.count() == 0) {
            String siteJson = readClasspath("seed/site.json");
            siteParamsRepository.save(new SiteParams(siteJson));
            log.info("Seed: paramètres du site chargés ({} octets)", siteJson.length());
        }
        if (chambreRepository.count() == 0) {
            JsonNode chambres = objectMapper.readTree(readClasspath("seed/chambres.json"));
            int n = 0;
            for (JsonNode c : chambres) {
                Chambre ch = new Chambre();
                ch.setSlug(c.get("slug").asText());
                ch.setTitre(c.get("titre").asText());
                ch.setOrdre(c.path("ordre").asInt(99));
                ch.setSurface(c.path("surface").asText(""));
                ch.setCapacite(c.path("capacite").asText(""));
                ch.setResume(c.path("resume").asText(""));
                ch.setImage(c.path("image").asText(""));
                ch.setContenu(c.path("contenuHtml").asText(""));
                ch.setEquipements(objectMapper.writeValueAsString(c.path("equipements")));
                ch.setPhotos(objectMapper.writeValueAsString(c.path("photos")));
                chambreRepository.save(ch);
                n++;
            }
            log.info("Seed: {} chambres chargées", n);
        }
        if (reservationRepository.count() == 0) {
            JsonNode dispo = objectMapper.readTree(readClasspath("seed/disponibilites.json"));
            JsonNode reservations = dispo.path("reservations");
            int n = 0;
            if (reservations.isArray()) {
                for (JsonNode r : reservations) {
                    Reservation res = new Reservation();
                    res.setChambre(r.get("chambre").asText());
                    res.setDebut(LocalDate.parse(r.get("debut").asText()));
                    res.setFin(LocalDate.parse(r.get("fin").asText()));
                    res.setNote(r.path("note").asText(""));
                    reservationRepository.save(res);
                    n++;
                }
            }
            log.info("Seed: {} réservations chargées", n);
        }
    }

    private String readClasspath(String location) throws Exception {
        ClassPathResource resource = new ClassPathResource(location);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
