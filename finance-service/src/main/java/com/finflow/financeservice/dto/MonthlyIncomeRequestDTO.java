package com.finflow.financeservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record MonthlyIncomeRequestDTO(

        @NotNull
        @Min(1900)
        @Max(2100)
        Integer year,

        @NotNull
        @Min(1)
        @Max(12)
        Integer month,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal amount

) {
}
