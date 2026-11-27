package com.leschenesdelaven.api.repo;

import com.leschenesdelaven.api.model.Chambre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChambreRepository extends JpaRepository<Chambre, Long> {

    List<Chambre> findAllByOrderByOrdreAsc();

    Optional<Chambre> findBySlug(String slug);
}
