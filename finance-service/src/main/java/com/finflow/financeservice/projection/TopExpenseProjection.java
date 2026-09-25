package com.finflow.financeservice.projection;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface TopExpenseProjection {

    UUID getTransactionId();

    String getDescription();

    BigDecimal getAmount();

    UUID getCategoryId();

    String getCategoryName();

    LocalDate getDate();
}