package com.leschenesdelaven.api.repo;

import com.leschenesdelaven.api.model.TarifPeriode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TarifPeriodeRepository extends JpaRepository<TarifPeriode, Long> {

    List<TarifPeriode> findAllByOrderByDebutAsc();

    /** Périodes applicables à une chambre : spécifiques à la chambre + globales (chambre null). */
    @Query("select t from TarifPeriode t where t.chambre = :c or t.chambre is null order by t.debut asc")
    List<TarifPeriode> findApplicables(@Param("c") String c);

    /** Chevauchements pour une chambre (null = période globale) : [debut,fin] qui intersecte. */
    @Query("select t from TarifPeriode t where (t.chambre = :c or (t.chambre is null and :c is null)) "
            + "and t.debut < :fin and t.fin > :debut")
    List<TarifPeriode> findOverlapping(@Param("c") String c,
                                       @Param("debut") LocalDate debut,
                                       @Param("fin") LocalDate fin);
}
