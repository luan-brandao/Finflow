package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CategorySummaryDTO(
        UUID categoryId,
        String categoryName,
        BigDecimal total
) {
}