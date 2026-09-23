package com.finflow.userservice.tdo;

import com.finflow.userservice.model.Role;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        Role role,
        LocalDateTime created,
        LocalDateTime updated
) {
}