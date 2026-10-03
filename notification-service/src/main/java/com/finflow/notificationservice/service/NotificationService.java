package com.finflow.notificationservice.service;

import com.finflow.notificationservice.dto.NotificationResponseDTO;
import com.finflow.notificationservice.dto.UserNotificationPreferenceDTO;
import com.finflow.notificationservice.exception.AccessDeniedException;
import com.finflow.notificationservice.exception.ResourceNotFoundException;
import com.finflow.notificationservice.mapper.NotificationMapper;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.model.UserNotificationPreference;
import com.finflow.notificationservice.repository.NotificationRepository;
import com.finflow.notificationservice.repository.UserNotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final NotificationMapper mapper;

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> findAllForUser(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(mapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnreadForUser(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationResponseDTO markAsRead(UUID id, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada."));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return mapper.toResponseDTO(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Notification notification = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada."));
        notificationRepository.delete(notification);
    }

    @Transactional(readOnly = true)
    public UserNotificationPreferenceDTO getPreferences(UUID userId) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));
        return mapper.toPreferenceDTO(preference, userId);
    }

    @Transactional
    public UserNotificationPreferenceDTO updatePreferences(UUID userId, UserNotificationPreferenceDTO dto) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));

        preference.setReceiveInvoices(dto.receiveInvoices());
        preference.setReceiveGoals(dto.receiveGoals());
        preference.setReceiveBudgets(dto.receiveBudgets());
        preference.setReceiveSummary(dto.receiveSummary());

        UserNotificationPreference saved = preferenceRepository.save(preference);
        return mapper.toPreferenceDTO(saved, userId);
    }

    @Transactional(readOnly = true)
    public boolean isCategoryEnabled(UUID userId, String category) {
        UserNotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));

        return switch (category.toUpperCase()) {
            case "FATURAS", "INVOICES" -> preference.isReceiveInvoices();
            case "METAS", "GOALS" -> preference.isReceiveGoals();
            case "ORCAMENTOS", "BUDGETS" -> preference.isReceiveBudgets();
            case "RESUMO", "SUMMARY" -> preference.isReceiveSummary();
            default -> true;
        };
    }

    @Transactional
    public void saveNotification(Notification notification) {
        if (notificationRepository.existsByEventId(notification.getEventId())) {
            return; // Idempotency check passed
        }
        notificationRepository.save(notification);
    }

    private UserNotificationPreference createDefaultPreference(UUID userId) {
        UserNotificationPreference preference = UserNotificationPreference.builder()
                .userId(userId)
                .receiveInvoices(true)
                .receiveGoals(true)
                .receiveBudgets(true)
                .receiveSummary(true)
                .build();
        return preferenceRepository.save(preference);
    }
}
