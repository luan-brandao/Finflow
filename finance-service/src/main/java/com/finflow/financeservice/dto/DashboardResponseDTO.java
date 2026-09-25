package com.finflow.financeservice.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponseDTO(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        Long transactionCount,
        List<CategorySummaryDTO> incomeByCategory,
        List<CategorySummaryDTO> expenseByCategory,
        List<MonthlySummaryDTO> monthlySummary,
        List<TopExpenseDTO> topExpenses,
        List<RecentTransactionDTO> recentTransactions
) {
}