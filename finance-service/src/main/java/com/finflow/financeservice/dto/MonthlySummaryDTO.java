package com.finflow.financeservice.dto;

import java.math.BigDecimal;

public record MonthlySummaryDTO(
        Integer year,
        Integer month,
        BigDecimal totalIncome,
        BigDecimal totalExpense
) {
}