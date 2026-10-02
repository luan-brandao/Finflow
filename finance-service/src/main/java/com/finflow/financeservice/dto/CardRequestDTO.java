package com.finflow.financeservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CardRequestDTO(

        @NotBlank
        @Size(max = 100)
        String name,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal creditLimit,

        @NotNull
        @Min(1)
        @Max(31)
        Integer dueDay

) {
}
