package com.finflow.financeservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "category_budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "category_id", nullable = false, unique = true)
    private UUID categoryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "limit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "notified_80", nullable = false)
    private boolean notified80 = false;

    @Column(name = "notified_100", nullable = false)
    private boolean notified100 = false;

    @Column(name = "notified_over", nullable = false)
    private boolean notifiedOver = false;
}
