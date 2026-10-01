package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record GoalResponseDTO(
        UUID id,
        UUID userId,
        String title,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate targetDate,
        LocalDateTime createdAt
) {
}
