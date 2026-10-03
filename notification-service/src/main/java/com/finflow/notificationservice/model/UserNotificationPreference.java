package com.finflow.notificationservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "receive_invoices", nullable = false)
    private boolean receiveInvoices = true;

    @Column(name = "receive_goals", nullable = false)
    private boolean receiveGoals = true;

    @Column(name = "receive_budgets", nullable = false)
    private boolean receiveBudgets = true;

    @Column(name = "receive_summary", nullable = false)
    private boolean receiveSummary = true;
}
