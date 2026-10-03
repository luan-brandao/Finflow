package com.finflow.notificationservice.dto;

import java.util.UUID;

public record UserNotificationPreferenceDTO(
        UUID userId,
        boolean receiveInvoices,
        boolean receiveGoals,
        boolean receiveBudgets,
        boolean receiveSummary
) {
}
