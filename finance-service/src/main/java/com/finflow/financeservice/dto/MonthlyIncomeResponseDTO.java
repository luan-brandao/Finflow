package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MonthlyIncomeResponseDTO(
        UUID id,
        UUID userId,
        Integer year,
        Integer month,
        BigDecimal amount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
