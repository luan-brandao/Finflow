package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CardInvoiceResponseDTO(
        UUID id,
        UUID cardId,
        UUID userId,
        int year,
        int month,
        BigDecimal amount,
        String status, // OPEN, CLOSED, PAID
        LocalDate dueDate,
        LocalDateTime closedAt,
        LocalDateTime paidAt
) {
}
