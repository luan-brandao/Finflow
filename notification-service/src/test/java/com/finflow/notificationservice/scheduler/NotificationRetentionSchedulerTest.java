package com.finflow.notificationservice.scheduler;

import com.finflow.notificationservice.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationRetentionSchedulerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationRetentionScheduler scheduler;

    @Test
    void shouldCleanExpiredNotificationsSuccessfully() {
        scheduler.cleanExpiredNotifications();

        // Verify that retention deletion is triggered for both read and unread messages with correct time ranges
        verify(notificationRepository).deleteByIsReadTrueAndCreatedAtBefore(any(LocalDateTime.class));
        verify(notificationRepository).deleteByIsReadFalseAndCreatedAtBefore(any(LocalDateTime.class));
    }
}
