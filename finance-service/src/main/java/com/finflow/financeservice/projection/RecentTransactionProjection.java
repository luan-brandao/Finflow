package com.finflow.financeservice.projection;

import com.finflow.financeservice.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface RecentTransactionProjection {

    UUID getTransactionId();

    String getDescription();

    BigDecimal getAmount();

    TransactionType getType();

    UUID getCategoryId();

    String getCategoryName();

    LocalDate getDate();
}