package com.leschenesdelaven.api.repo;

import com.leschenesdelaven.api.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findAllByOrderByDebutAsc();

    List<Reservation> findByChambreOrderByDebutAsc(String chambre);

    /** Chevauchements : réservations existantes dont [debut, fin] intersecte ]debut, fin[. */
    @Query("select r from Reservation r where r.chambre = :chambre "
            + "and r.debut < :fin and r.fin > :debut")
    List<Reservation> findOverlapping(@Param("chambre") String chambre,
                                      @Param("debut") LocalDate debut,
                                      @Param("fin") LocalDate fin);
}
