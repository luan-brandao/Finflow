package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CategorySummaryDTO;
import com.finflow.financeservice.dto.DashboardResponseDTO;
import com.finflow.financeservice.dto.MonthlySummaryDTO;
import com.finflow.financeservice.dto.RecentTransactionDTO;
import com.finflow.financeservice.dto.TopExpenseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.model.TransactionType;
import com.finflow.financeservice.projection.CategorySummaryProjection;
import com.finflow.financeservice.projection.MonthlySummaryProjection;
import com.finflow.financeservice.projection.RecentTransactionProjection;
import com.finflow.financeservice.projection.TopExpenseProjection;
import com.finflow.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboard(
            LocalDate startDate,
            LocalDate endDate
    ) {

        UUID userId = getAuthenticatedUserId();

        BigDecimal totalIncome =
                transactionRepository.sumIncomeByUserIdAndPeriod(
                        userId,
                        startDate,
                        endDate
                );

        BigDecimal totalExpense =
                transactionRepository.sumExpenseByUserIdAndPeriod(
                        userId,
                        startDate,
                        endDate
                );

        long transactionCount =
                transactionRepository.countByUserIdAndPeriod(
                        userId,
                        startDate,
                        endDate
                );

        List<CategorySummaryDTO> incomeByCategory =
                transactionRepository
                        .sumIncomeByCategory(
                                userId,
                                startDate,
                                endDate
                        )
                        .stream()
                        .map(this::toCategorySummaryDTO)
                        .toList();

        List<CategorySummaryDTO> expenseByCategory =
                transactionRepository
                        .sumExpenseByCategory(
                                userId,
                                startDate,
                                endDate
                        )
                        .stream()
                        .map(this::toCategorySummaryDTO)
                        .toList();

        List<MonthlySummaryDTO> monthlySummary =
                transactionRepository
                        .findMonthlySummary(
                                userId,
                                startDate,
                                endDate
                        )
                        .stream()
                        .map(this::toMonthlySummaryDTO)
                        .toList();

        List<TopExpenseDTO> topExpenses =
                transactionRepository
                        .findTopExpenses(
                                userId,
                                startDate,
                                endDate,
                                PageRequest.of(0, 5)
                        )
                        .stream()
                        .map(this::toTopExpenseDTO)
                        .toList();

        List<RecentTransactionDTO> recentTransactions =
                transactionRepository
                        .findRecentTransactions(
                                userId,
                                startDate,
                                endDate,
                                PageRequest.of(0, 10)
                        )
                        .stream()
                        .map(this::toRecentTransactionDTO)
                        .toList();

        BigDecimal balance =
                totalIncome.subtract(totalExpense);

        return new DashboardResponseDTO(
                totalIncome,
                totalExpense,
                balance,
                transactionCount,
                incomeByCategory,
                expenseByCategory,
                monthlySummary,
                topExpenses,
                recentTransactions
        );
    }

    private CategorySummaryDTO toCategorySummaryDTO(
            CategorySummaryProjection projection
    ) {

        return new CategorySummaryDTO(
                projection.getCategoryId(),
                projection.getCategoryName(),
                projection.getTotal()
        );
    }

    private MonthlySummaryDTO toMonthlySummaryDTO(
            MonthlySummaryProjection projection
    ) {

        return new MonthlySummaryDTO(
                projection.getYear(),
                projection.getMonth(),
                projection.getTotalIncome(),
                projection.getTotalExpense()
        );
    }

    private TopExpenseDTO toTopExpenseDTO(
            TopExpenseProjection projection
    ) {

        return new TopExpenseDTO(
                projection.getTransactionId(),
                projection.getDescription(),
                projection.getAmount(),
                projection.getCategoryId(),
                projection.getCategoryName(),
                projection.getDate()
        );
    }

    private RecentTransactionDTO toRecentTransactionDTO(
            RecentTransactionProjection projection
    ) {

        return new RecentTransactionDTO(
                projection.getTransactionId(),
                projection.getDescription(),
                projection.getAmount(),
                TransactionType.valueOf(
                        projection.getType().name()
                ),
                projection.getCategoryId(),
                projection.getCategoryName(),
                projection.getDate()
        );
    }

    private UUID getAuthenticatedUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new AccessDeniedException(
                    "Usuário não autenticado."
            );
        }

        try {

            return UUID.fromString(
                    authentication.getName()
            );

        } catch (IllegalArgumentException exception) {

            throw new AccessDeniedException(
                    "Usuário autenticado inválido."
            );
        }
    }
}