package com.finflow.userservice.tdo;

public record LoginResponseDTO(
        String token,
        String type
) {
}