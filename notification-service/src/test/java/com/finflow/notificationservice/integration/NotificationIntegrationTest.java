package com.finflow.notificationservice.integration;

import com.finflow.notificationservice.TestcontainersConfiguration;
import com.finflow.notificationservice.dto.FinanceEvent;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.model.UserNotificationPreference;
import com.finflow.notificationservice.repository.NotificationRepository;
import com.finflow.notificationservice.repository.UserNotificationPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class NotificationIntegrationTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserNotificationPreferenceRepository preferenceRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        notificationRepository.deleteAll();
        preferenceRepository.deleteAll();

        // Save a default notification preference for the user
        UserNotificationPreference preference = UserNotificationPreference.builder()
                .userId(userId)
                .receiveInvoices(true)
                .receiveGoals(true)
                .receiveBudgets(true)
                .receiveSummary(true)
                .build();
        preferenceRepository.save(preference);
    }

    @Test
    void shouldConsumeFinanceEventAndPersistNotificationWithIdempotency() throws Exception {
        UUID eventId = UUID.randomUUID();
        Map<String, Object> payload = new HashMap<>();
        payload.put("goalTitle", "Viagem Europa");
        payload.put("amount", "12000.00");

        FinanceEvent event = new FinanceEvent(
                eventId,
                "GOAL_REACHED",
                userId,
                LocalDateTime.now(),
                payload
        );

        // Send the event to RabbitMQ broker
        rabbitTemplate.convertAndSend("finflow.finance.exchange", "finance.goal.reached", event);

        // Wait a short time for RabbitMQ asynchronous consumer to pick and save to Postgres
        boolean processed = false;
        for (int i = 0; i < 30; i++) {
            List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!list.isEmpty()) {
                processed = true;
                break;
            }
            TimeUnit.MILLISECONDS.sleep(200);
        }

        assertThat(processed).isTrue();

        List<Notification> savedList = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        assertThat(savedList).hasSize(1);
        Notification notification = savedList.get(0);
        assertThat(notification.getEventId()).isEqualTo(eventId);
        assertThat(notification.getCategory()).isEqualTo("METAS");
        assertThat(notification.getTitle()).contains("Meta Atingida");
        assertThat(notification.getContent()).contains("Viagem Europa");

        // Now test Idempotency: Send the exact same event again
        rabbitTemplate.convertAndSend("finflow.finance.exchange", "finance.goal.reached", event);
        TimeUnit.MILLISECONDS.sleep(1000); // Wait for consumer to process

        // The list must still have size 1 (the duplicate event is discarded gracefully)
        List<Notification> listAfterDuplicate = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        assertThat(listAfterDuplicate).hasSize(1);
    }
}
