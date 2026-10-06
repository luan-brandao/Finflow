package com.finflow.notificationservice.consumer;

import com.finflow.notificationservice.dto.FinanceEvent;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Test
    void shouldConsumeGoalReachedEventSuccessfully() {
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Map<String, Object> payload = new HashMap<>();
        payload.put("goalTitle", "Reserva Financeira");
        payload.put("amount", "10000.00");

        FinanceEvent event = new FinanceEvent(
                eventId,
                "GOAL_REACHED",
                userId,
                LocalDateTime.now(),
                payload
        );

        when(notificationService.isCategoryEnabled(userId, "METAS")).thenReturn(true);

        notificationConsumer.consumeFinanceEvent(event);

        verify(notificationService).saveNotification(argThat(n -> 
            n.getUserId().equals(userId) &&
            n.getCategory().equals("METAS") &&
            n.getPriority().equals("SUCCESS") &&
            n.getTitle().contains("Meta Atingida") &&
            n.getContent().contains("Reserva Financeira") &&
            n.getEventId().equals(eventId)
        ));
    }

    @Test
    void shouldIgnoreEventWhenCategoryIsDisabledByUserPreferences() {
        UUID eventId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        FinanceEvent event = new FinanceEvent(
                eventId,
                "BUDGET_EXCEEDED",
                userId,
                LocalDateTime.now(),
                new HashMap<>()
        );

        // User disabled budgets notifications
        when(notificationService.isCategoryEnabled(userId, "ORCAMENTOS")).thenReturn(false);

        notificationConsumer.consumeFinanceEvent(event);

        verify(notificationService, never()).saveNotification(any(Notification.class));
    }
}
