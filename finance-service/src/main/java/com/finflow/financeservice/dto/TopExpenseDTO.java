package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TopExpenseDTO(
        UUID transactionId,
        String description,
        BigDecimal amount,
        UUID categoryId,
        String categoryName,
        LocalDate date
) {
}