package com.leschenesdelaven.api.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leschenesdelaven.api.dto.ChambreDetail;
import com.leschenesdelaven.api.dto.ChambreSummary;
import com.leschenesdelaven.api.dto.ContactRequest;
import com.leschenesdelaven.api.dto.ReservationView;
import com.leschenesdelaven.api.dto.TarifPeriodeView;
import com.leschenesdelaven.api.repo.TarifPeriodeRepository;
import com.leschenesdelaven.api.model.Chambre;
import com.leschenesdelaven.api.model.Message;
import com.leschenesdelaven.api.model.SiteParams;
import com.leschenesdelaven.api.repo.ChambreRepository;
import com.leschenesdelaven.api.repo.MessageRepository;
import com.leschenesdelaven.api.repo.ReservationRepository;
import com.leschenesdelaven.api.repo.SiteParamsRepository;
import com.leschenesdelaven.api.service.MailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/** API publique (lecture seule + formulaire de contact), utilisée par le front Angular. */
@RestController
@RequestMapping("/api/public")
public class PublicApiController {

    private final SiteParamsRepository siteParamsRepository;
    private final ChambreRepository chambreRepository;
    private final ReservationRepository reservationRepository;
    private final MessageRepository messageRepository;
    private final TarifPeriodeRepository tarifPeriodeRepository;
    private final MailService mailService;
    private final ObjectMapper objectMapper;

    public PublicApiController(SiteParamsRepository siteParamsRepository,
                               ChambreRepository chambreRepository,
                               ReservationRepository reservationRepository,
                               MessageRepository messageRepository,
                               TarifPeriodeRepository tarifPeriodeRepository,
                               MailService mailService,
                               ObjectMapper objectMapper) {
        this.siteParamsRepository = siteParamsRepository;
        this.chambreRepository = chambreRepository;
        this.reservationRepository = reservationRepository;
        this.messageRepository = messageRepository;
        this.tarifPeriodeRepository = tarifPeriodeRepository;
        this.mailService = mailService;
        this.objectMapper = objectMapper;
    }

    private JsonNode siteJson() {
        SiteParams params = siteParamsRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Paramètres du site absents"));
        try {
            return objectMapper.readTree(params.getData());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Paramètres du site illisibles");
        }
    }

    /**
     * Token CSRF pour l'app mobile (Capacitor) : en cross-origin (app servie en http://localhost,
     * API sur une autre origine), le cookie XSRF-TOKEN n'est pas lisible en JS — on le renvoie ici
     * pour que l'app puisse le renvoyer en en-tête X-XSRF-TOKEN.
     */
    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {
        CsrfToken t = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (t == null) t = (CsrfToken) request.getAttribute("_csrf");
        return Map.of("token", t != null ? t.getToken() : "");
    }

    /** Paramètres généraux du site (coordonnées, tarifs, nav, saison, réseaux sociaux...). */
    @GetMapping("/site")
    public JsonNode site() {
        return siteJson();
    }

    /** Dates d'ouverture de la saison (répétées chaque année dans les calendriers). */
    @GetMapping("/saison")
    public Map<String, String> saison() {
        JsonNode saison = siteJson().path("saison");
        return Map.of(
                "debut", saison.path("debut").asText(""),
                "fin", saison.path("fin").asText(""));
    }

    @GetMapping("/chambres")
    public List<ChambreSummary> chambres() {
        return chambreRepository.findAllByOrderByOrdreAsc().stream()
                .map(ChambreSummary::of)
                .toList();
    }

    @GetMapping("/chambres/{slug}")
    public ChambreDetail chambre(@PathVariable String slug) throws Exception {
        Chambre c = chambreRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chambre inconnue : " + slug));
        List<String> equipements = objectMapper.readValue(c.getEquipements(), new TypeReference<>() {});
        List<String> photos = objectMapper.readValue(c.getPhotos(), new TypeReference<>() {});
        List<TarifPeriodeView> periodes = tarifPeriodeRepository.findApplicables(slug).stream()
                .map(TarifPeriodeView::of).toList();
        return new ChambreDetail(c.getSlug(), c.getTitre(), c.getOrdre(), c.getSurface(), c.getCapacite(),
                c.getResume(), c.getImage(), c.getContenu(), equipements, photos,
                c.getTarif1(), c.getTarif2(), periodes);
    }

    /** Disponibilités : toutes les réservations, ou filtrées par ?chambre=slug. */
    @GetMapping("/disponibilites")
    public List<ReservationView> disponibilites(@RequestParam(required = false) String chambre) {
        var list = (chambre == null || chambre.isBlank())
                ? reservationRepository.findAllByOrderByDebutAsc()
                : reservationRepository.findByChambreOrderByDebutAsc(chambre);
        return list.stream().map(ReservationView::of).toList();
    }

    @PostMapping("/contact")
    public Map<String, Object> contact(@Valid @RequestBody ContactRequest body) {
        Message m = new Message();
        m.setNom(body.nom());
        m.setEmail(body.email());
        m.setTel(body.tel());
        m.setChambre(body.chambre());
        m.setArrivee(body.arrivee());
        m.setDepart(body.depart());
        m.setMessage(body.message());
        messageRepository.save(m);
        mailService.sendContactMessage(m);
        messageRepository.save(m); // persiste mailEnvoye
        return Map.of("ok", true, "mailEnvoye", mailService.isConfigured());
    }
}
