package com.leschenesdelaven.api.repo;

import com.leschenesdelaven.api.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
