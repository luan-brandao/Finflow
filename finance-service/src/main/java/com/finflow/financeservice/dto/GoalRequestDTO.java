package com.finflow.financeservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequestDTO(

        @NotBlank
        @Size(max = 150)
        String title,

        @NotNull
        @DecimalMin(value = "0.01")
        BigDecimal targetAmount,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal currentAmount,

        @NotNull
        LocalDate targetDate
) {
}
