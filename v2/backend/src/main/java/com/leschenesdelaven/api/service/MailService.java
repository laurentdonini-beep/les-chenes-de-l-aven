package com.leschenesdelaven.api.service;

import com.leschenesdelaven.api.model.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Envoi des messages de contact par mail. Si aucun SMTP n'est configuré
 * (SMTP_HOST vide), le message reste enregistré en base et le front
 * bascule en mailto. L'envoi ne doit jamais faire échouer la requête.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final String mailHost;
    private final String mailFrom;
    private final String mailTo;

    public MailService(JavaMailSender mailSender,
                       @Value("${spring.mail.host:}") String mailHost,
                       @Value("${app.mail.from:contact@leschenesdelaven.fr}") String mailFrom,
                       @Value("${app.mail.to:contact@leschenesdelaven.fr}") String mailTo) {
        this.mailSender = mailSender;
        this.mailHost = mailHost;
        this.mailFrom = mailFrom;
        this.mailTo = mailTo;
    }

    public boolean isConfigured() {
        return mailHost != null && !mailHost.isBlank();
    }

    public void sendContactMessage(Message m) {
        if (!isConfigured()) {
            log.info("SMTP non configuré : message de {} enregistré en base uniquement (id={})",
                    m.getEmail(), m.getId());
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(mailTo);
            msg.setReplyTo(m.getEmail());
            msg.setSubject("[Site] Demande de réservation — " + m.getNom());
            StringBuilder body = new StringBuilder();
            body.append("Nom : ").append(m.getNom()).append('\n');
            body.append("Email : ").append(m.getEmail()).append('\n');
            if (m.getTel() != null && !m.getTel().isBlank()) body.append("Tél : ").append(m.getTel()).append('\n');
            if (m.getChambre() != null && !m.getChambre().isBlank()) body.append("Chambre : ").append(m.getChambre()).append('\n');
            if (m.getArrivee() != null && !m.getArrivee().isBlank()) body.append("Arrivée : ").append(m.getArrivee()).append('\n');
            if (m.getDepart() != null && !m.getDepart().isBlank()) body.append("Départ : ").append(m.getDepart()).append('\n');
            body.append('\n').append(m.getMessage()).append('\n');
            msg.setText(body.toString());
            mailSender.send(msg);
            m.setMailEnvoye(true);
            log.info("Message de {} envoyé par mail", m.getEmail());
        } catch (Exception e) {
            log.warn("Échec envoi mail pour message id={} : {}", m.getId(), e.getMessage());
        }
    }
}
