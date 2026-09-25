package com.finflow.financeservice.projection;

import java.math.BigDecimal;

public interface MonthlySummaryProjection {

    Integer getYear();

    Integer getMonth();

    BigDecimal getTotalIncome();

    BigDecimal getTotalExpense();
}