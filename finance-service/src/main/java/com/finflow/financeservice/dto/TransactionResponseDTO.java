package com.finflow.financeservice.dto;

import com.finflow.financeservice.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponseDTO(

        UUID id,

        UUID userId,

        String description,

        BigDecimal amount,

        TransactionType type,

        UUID categoryId,

        LocalDate date,

        LocalDateTime createdAt

) {
}