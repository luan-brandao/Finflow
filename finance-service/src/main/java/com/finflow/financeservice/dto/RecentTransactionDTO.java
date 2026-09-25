package com.finflow.financeservice.dto;

import com.finflow.financeservice.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecentTransactionDTO(
        UUID transactionId,
        String description,
        BigDecimal amount,
        TransactionType type,
        UUID categoryId,
        String categoryName,
        LocalDate date
) {
}