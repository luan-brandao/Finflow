package com.finflow.notificationservice.service;

import com.finflow.notificationservice.dto.NotificationResponseDTO;
import com.finflow.notificationservice.dto.UserNotificationPreferenceDTO;
import com.finflow.notificationservice.exception.ResourceNotFoundException;
import com.finflow.notificationservice.mapper.NotificationMapper;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.model.UserNotificationPreference;
import com.finflow.notificationservice.repository.NotificationRepository;
import com.finflow.notificationservice.repository.UserNotificationPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserNotificationPreferenceRepository preferenceRepository;

    @Mock
    private NotificationMapper mapper;

    @InjectMocks
    private NotificationService notificationService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void shouldFindAllNotificationsForUserOrderedByDate() {
        Notification n1 = new Notification();
        n1.setUserId(userId);
        Notification n2 = new Notification();
        n2.setUserId(userId);

        NotificationResponseDTO dto1 = mock(NotificationResponseDTO.class);
        NotificationResponseDTO dto2 = mock(NotificationResponseDTO.class);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(n1, n2));
        when(mapper.toResponseDTO(n1)).thenReturn(dto1);
        when(mapper.toResponseDTO(n2)).thenReturn(dto2);

        List<NotificationResponseDTO> result = notificationService.findAllForUser(userId);

        assertEquals(2, result.size());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Test
    void shouldCountUnreadNotificationsSuccessfully() {
        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(5L);

        long count = notificationService.countUnreadForUser(userId);

        assertEquals(5L, count);
        verify(notificationRepository).countByUserIdAndIsReadFalse(userId);
    }

    @Test
    void shouldMarkAsReadSuccessfully() {
        UUID id = UUID.randomUUID();
        Notification notification = new Notification();
        notification.setId(id);
        notification.setUserId(userId);
        notification.setRead(false);

        when(notificationRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);
        when(mapper.toResponseDTO(notification)).thenReturn(mock(NotificationResponseDTO.class));

        notificationService.markAsRead(id, userId);

        assertTrue(notification.isRead());
        assertNotNull(notification.getReadAt());
        verify(notificationRepository).save(notification);
    }

    @Test
    void shouldMarkAllNotificationsAsReadSuccessfully() {
        Notification n1 = new Notification();
        n1.setUserId(userId);
        n1.setRead(false);
        Notification n2 = new Notification();
        n2.setUserId(userId);
        n2.setRead(false);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead(userId);

        assertTrue(n1.isRead());
        assertNotNull(n1.getReadAt());
        assertTrue(n2.isRead());
        assertNotNull(n2.getReadAt());
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void shouldDeleteNotificationSuccessfully() {
        UUID id = UUID.randomUUID();
        Notification notification = new Notification();
        notification.setId(id);
        notification.setUserId(userId);

        when(notificationRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.of(notification));

        notificationService.delete(id, userId);

        verify(notificationRepository).delete(notification);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingNotification() {
        UUID id = UUID.randomUUID();
        when(notificationRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.delete(id, userId));
    }

    @Test
    void shouldRespectUserPreferencesDisabledCategory() {
        UserNotificationPreference preference = new UserNotificationPreference();
        preference.setUserId(userId);
        preference.setReceiveGoals(false); // user disabled goals category

        when(preferenceRepository.findByUserId(userId)).thenReturn(Optional.of(preference));

        boolean isGoalsEnabled = notificationService.isCategoryEnabled(userId, "METAS");

        assertFalse(isGoalsEnabled);
    }

    @Test
    void shouldSaveNotificationIdempotently() {
        UUID eventId = UUID.randomUUID();
        Notification notification = new Notification();
        notification.setEventId(eventId);

        // eventId already exists in DB (simulating a duplicate event)
        when(notificationRepository.existsByEventId(eventId)).thenReturn(true);

        notificationService.saveNotification(notification);

        // Should NOT save since existsByEventId returned true (idempotency safety check)
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void shouldSaveNotificationWhenEventIdIsNew() {
        UUID eventId = UUID.randomUUID();
        Notification notification = new Notification();
        notification.setEventId(eventId);

        when(notificationRepository.existsByEventId(eventId)).thenReturn(false);

        notificationService.saveNotification(notification);

        // Should save since existsByEventId returned false
        verify(notificationRepository).save(notification);
    }
}
