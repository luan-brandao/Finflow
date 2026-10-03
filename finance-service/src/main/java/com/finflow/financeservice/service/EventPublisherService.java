package com.finflow.financeservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;
    public static final String EXCHANGE_NAME = "finflow.finance.exchange";

    public void publishEvent(String routingKey, String eventType, UUID userId, Map<String, Object> payload) {
        UUID eventId = UUID.randomUUID();
        LocalDateTime occurredAt = LocalDateTime.now();

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", eventId);
        event.put("eventType", eventType);
        event.put("userId", userId);
        event.put("occurredAt", occurredAt);
        event.put("payload", payload);

        try {
            log.info("Publicando evento no RabbitMQ: Exchange={}, RoutingKey={}, EventID={}, Tipo={}", 
                    EXCHANGE_NAME, routingKey, eventId, eventType);
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, routingKey, event);
        } catch (Exception e) {
            log.error("Falha ao publicar evento " + eventId + " no RabbitMQ: " + e.getMessage(), e);
        }
    }
}
