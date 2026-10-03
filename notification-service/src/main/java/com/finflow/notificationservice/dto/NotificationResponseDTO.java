package com.finflow.notificationservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponseDTO(
        UUID id,
        UUID userId,
        String category,
        String priority,
        String title,
        String content,
        boolean isRead,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
}
