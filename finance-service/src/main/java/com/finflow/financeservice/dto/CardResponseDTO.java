package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CardResponseDTO(
        UUID id,
        UUID userId,
        String name,
        BigDecimal creditLimit,
        int dueDay,
        BigDecimal used,
        BigDecimal available,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
