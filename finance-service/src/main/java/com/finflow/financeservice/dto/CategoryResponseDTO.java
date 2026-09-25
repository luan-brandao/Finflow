package com.finflow.financeservice.dto;

import java.util.UUID;

public record CategoryResponseDTO(
        UUID id,
        String name,
        UUID userId,
        boolean isDefault
) {
}