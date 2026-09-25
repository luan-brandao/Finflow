package com.finflow.financeservice.dto;

import java.time.LocalDateTime;

public record ErrorResponse(

        int status,

        String message,

        LocalDateTime timestamp,

        String path

) {
}