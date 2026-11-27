package com.leschenesdelaven.api.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leschenesdelaven.api.dto.ChambreDetail;
import com.leschenesdelaven.api.dto.ChambreSummary;
import com.leschenesdelaven.api.dto.ContactRequest;
import com.leschenesdelaven.api.dto.ReservationView;
import com.leschenesdelaven.api.model.Chambre;
import com.leschenesdelaven.api.model.Message;
import com.leschenesdelaven.api.model.SiteParams;
import com.leschenesdelaven.api.repo.ChambreRepository;
import com.leschenesdelaven.api.repo.MessageRepository;
import com.leschenesdelaven.api.repo.ReservationRepository;
import com.leschenesdelaven.api.repo.SiteParamsRepository;
import com.leschenesdelaven.api.service.MailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    private final MailService mailService;
    private final ObjectMapper objectMapper;

    public PublicApiController(SiteParamsRepository siteParamsRepository,
                               ChambreRepository chambreRepository,
                               ReservationRepository reservationRepository,
                               MessageRepository messageRepository,
                               MailService mailService,
                               ObjectMapper objectMapper) {
        this.siteParamsRepository = siteParamsRepository;
        this.chambreRepository = chambreRepository;
        this.reservationRepository = reservationRepository;
        this.messageRepository = messageRepository;
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
        return new ChambreDetail(c.getSlug(), c.getTitre(), c.getOrdre(), c.getSurface(), c.getCapacite(),
                c.getResume(), c.getImage(), c.getContenu(), equipements, photos);
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
