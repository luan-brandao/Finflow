package com.finflow.notificationservice.repository;

import com.finflow.notificationservice.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndIsReadFalse(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByEventId(UUID eventId);

    void deleteByIsReadTrueAndCreatedAtBefore(LocalDateTime threshold);

    void deleteByIsReadFalseAndCreatedAtBefore(LocalDateTime threshold);
}
