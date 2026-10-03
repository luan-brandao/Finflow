package com.finflow.notificationservice.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record FinanceEvent(
        UUID eventId,
        String eventType,
        UUID userId,
        LocalDateTime occurredAt,
        Map<String, Object> payload
) {
}
