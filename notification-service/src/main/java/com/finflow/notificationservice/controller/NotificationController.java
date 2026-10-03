package com.finflow.notificationservice.controller;

import com.finflow.notificationservice.dto.NotificationResponseDTO;
import com.finflow.notificationservice.dto.UserNotificationPreferenceDTO;
import com.finflow.notificationservice.exception.AccessDeniedException;
import com.finflow.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> findAll() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.findAllForUser(userId));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnread() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.countUnreadForUser(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable UUID id) {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        UUID userId = getAuthenticatedUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID userId = getAuthenticatedUserId();
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<UserNotificationPreferenceDTO> getPreferences() {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.getPreferences(userId));
    }

    @PutMapping("/preferences")
    public ResponseEntity<UserNotificationPreferenceDTO> updatePreferences(
            @RequestBody UserNotificationPreferenceDTO dto
    ) {
        UUID userId = getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.updatePreferences(userId, dto));
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado.");
        }
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Identificação de usuário inválida.");
        }
    }
}
