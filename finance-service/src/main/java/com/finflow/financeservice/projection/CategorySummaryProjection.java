package com.finflow.financeservice.projection;

import java.math.BigDecimal;
import java.util.UUID;

public interface CategorySummaryProjection {

    UUID getCategoryId();

    String getCategoryName();

    BigDecimal getTotal();
}