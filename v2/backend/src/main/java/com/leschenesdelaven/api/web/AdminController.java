package com.leschenesdelaven.api.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leschenesdelaven.api.dto.ChambreTarifsRequest;
import com.leschenesdelaven.api.dto.ReservationRequest;
import com.leschenesdelaven.api.dto.ReservationView;
import com.leschenesdelaven.api.dto.TarifPeriodeRequest;
import com.leschenesdelaven.api.dto.TarifPeriodeView;
import com.leschenesdelaven.api.model.Chambre;
import com.leschenesdelaven.api.model.Reservation;
import com.leschenesdelaven.api.model.TarifPeriode;
import com.leschenesdelaven.api.repo.TarifPeriodeRepository;
import com.leschenesdelaven.api.model.SiteParams;
import com.leschenesdelaven.api.repo.ChambreRepository;
import com.leschenesdelaven.api.repo.ReservationRepository;
import com.leschenesdelaven.api.repo.SiteParamsRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/** API d'administration (backoffice /bo) — réservée à l'utilisateur authentifié. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ReservationRepository reservationRepository;
    private final ChambreRepository chambreRepository;
    private final SiteParamsRepository siteParamsRepository;
    private final TarifPeriodeRepository tarifPeriodeRepository;
    private final ObjectMapper objectMapper;

    public AdminController(ReservationRepository reservationRepository,
                           ChambreRepository chambreRepository,
                           SiteParamsRepository siteParamsRepository,
                           TarifPeriodeRepository tarifPeriodeRepository,
                           ObjectMapper objectMapper) {
        this.reservationRepository = reservationRepository;
        this.chambreRepository = chambreRepository;
        this.siteParamsRepository = siteParamsRepository;
        this.tarifPeriodeRepository = tarifPeriodeRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/disponibilites")
    public List<ReservationView> listDisponibilites() {
        return reservationRepository.findAllByOrderByDebutAsc().stream()
                .map(ReservationView::of).toList();
    }

    @PostMapping("/disponibilites")
    public ReservationView createDisponibilite(@Valid @RequestBody ReservationRequest body) {
        if (!body.debut().isBefore(body.fin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début doit précéder la date de fin");
        }
        if (chambreRepository.findBySlug(body.chambre()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chambre inconnue : " + body.chambre());
        }
        if (!reservationRepository.findOverlapping(body.chambre(), body.debut(), body.fin()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chevauchement avec une réservation existante pour cette chambre");
        }
        Reservation r = new Reservation();
        r.setChambre(body.chambre());
        r.setDebut(body.debut());
        r.setFin(body.fin());
        r.setNote(body.note() == null ? "" : body.note());
        return ReservationView.of(reservationRepository.save(r));
    }

    @DeleteMapping("/disponibilites/{id}")
    public ResponseEntity<Void> deleteDisponibilite(@PathVariable long id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable : " + id);
        }
        reservationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/site")
    public JsonNode getSite() throws Exception {
        SiteParams params = currentParams();
        return objectMapper.readTree(params.getData());
    }

    /** Remplace les paramètres du site (dont la saison) — corps = JSON complet. */
    @PutMapping("/site")
    public Map<String, Object> putSite(@RequestBody JsonNode body) {
        if (body == null || !body.isObject() || !body.path("saison").isObject()
                || body.path("saison").path("debut").asText("").isBlank()
                || body.path("saison").path("fin").asText("").isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le JSON doit contenir un objet \"saison\" avec \"debut\" et \"fin\" (AAAA-MM-JJ)");
        }
        SiteParams params = currentParams();
        params.setData(body.toString());
        siteParamsRepository.save(params);
        return Map.of("ok", true);
    }

    // ---------------- Tarifs ----------------

    /** Prix de base d'une chambre (null = hériter des tarifs généraux du site). */
    @PutMapping("/chambres/{slug}/tarifs")
    public Map<String, Object> putTarifsChambre(@PathVariable String slug,
                                                @Valid @RequestBody ChambreTarifsRequest body) {
        Chambre c = chambreRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chambre inconnue : " + slug));
        c.setTarif1(body.tarif1());
        c.setTarif2(body.tarif2());
        chambreRepository.save(c);
        return Map.of("ok", true, "slug", slug, "tarif1", body.tarif1(), "tarif2", body.tarif2());
    }

    @GetMapping("/tarifs")
    public List<TarifPeriodeView> listTarifs() {
        return tarifPeriodeRepository.findAllByOrderByDebutAsc().stream()
                .map(TarifPeriodeView::of).toList();
    }

    @PostMapping("/tarifs")
    public TarifPeriodeView createTarif(@Valid @RequestBody TarifPeriodeRequest body) {
        return saveTarif(null, body);
    }

    @PutMapping("/tarifs/{id}")
    public TarifPeriodeView updateTarif(@PathVariable long id, @Valid @RequestBody TarifPeriodeRequest body) {
        if (!tarifPeriodeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Période tarifaire introuvable : " + id);
        }
        return saveTarif(id, body);
    }

    private TarifPeriodeView saveTarif(Long id, TarifPeriodeRequest body) {
        if (!body.debut().isBefore(body.fin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début doit précéder la date de fin");
        }
        String chambre = (body.chambre() == null || body.chambre().isBlank()) ? null : body.chambre();
        if (chambre != null && chambreRepository.findBySlug(chambre).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chambre inconnue : " + chambre);
        }
        var chevauchements = tarifPeriodeRepository.findOverlapping(chambre, body.debut(), body.fin());
        if (chevauchements.stream().anyMatch(t -> id == null || !t.getId().equals(id))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chevauchement avec une période tarifaire existante (même chambre ou globale)");
        }
        TarifPeriode t = (id == null) ? new TarifPeriode() : tarifPeriodeRepository.findById(id).orElseThrow();
        t.setChambre(chambre);
        t.setDebut(body.debut());
        t.setFin(body.fin());
        t.setPrix1(body.prix1());
        t.setPrix2(body.prix2());
        t.setLabel(body.label());
        return TarifPeriodeView.of(tarifPeriodeRepository.save(t));
    }

    @DeleteMapping("/tarifs/{id}")
    public ResponseEntity<Void> deleteTarif(@PathVariable long id) {
        if (!tarifPeriodeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Période tarifaire introuvable : " + id);
        }
        tarifPeriodeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private SiteParams currentParams() {
        return siteParamsRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Paramètres absents"));
    }
}
