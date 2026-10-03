package com.finflow.notificationservice.repository;

import com.finflow.notificationservice.model.UserNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserNotificationPreferenceRepository extends JpaRepository<UserNotificationPreference, UUID> {

    Optional<UserNotificationPreference> findByUserId(UUID userId);
}
