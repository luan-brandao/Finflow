package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CategorySummaryDTO;
import com.finflow.financeservice.dto.DashboardResponseDTO;
import com.finflow.financeservice.dto.MonthlySummaryDTO;
import com.finflow.financeservice.dto.RecentTransactionDTO;
import com.finflow.financeservice.dto.TopExpenseDTO;
import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.model.TransactionType;
import com.finflow.financeservice.projection.CategorySummaryProjection;
import com.finflow.financeservice.projection.MonthlySummaryProjection;
import com.finflow.financeservice.projection.RecentTransactionProjection;
import com.finflow.financeservice.projection.TopExpenseProjection;
import com.finflow.financeservice.repository.TransactionRepository;
import com.finflow.financeservice.repository.MonthlyIncomeRepository;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.model.Transaction;
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
    private final MonthlyIncomeRepository monthlyIncomeRepository;
    private final CategoryRepository categoryRepository;
    private final CardService cardService;

    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboard(
            LocalDate startDate,
            LocalDate endDate
    ) {
        return getDashboard(startDate, endDate, null, null, null);
    }

    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboard(
            LocalDate startDate,
            LocalDate endDate,
            UUID cardId,
            UUID categoryId,
            TransactionType type
    ) {
        UUID userId = getAuthenticatedUserId();

        // Fetch all transactions for this user and period
        List<Transaction> transactions = transactionRepository.findByUserIdAndPeriod(userId, startDate, endDate);

        // Fetch all categories (default + custom) to map names
        List<com.finflow.financeservice.model.Category> categories = categoryRepository.findByUserIdIsNullOrUserId(userId);
        java.util.Map<UUID, String> categoryNameMap = categories.stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.finflow.financeservice.model.Category::getId,
                        com.finflow.financeservice.model.Category::getName,
                        (a, b) -> a
                ));

        // Filter transactions based on the selected dynamic filters
        java.util.stream.Stream<Transaction> stream = transactions.stream();
        if (cardId != null) {
            stream = stream.filter(t -> cardId.equals(t.getCardId()));
        }
        if (categoryId != null) {
            stream = stream.filter(t -> categoryId.equals(t.getCategoryId()));
        }
        if (type != null) {
            stream = stream.filter(t -> type == t.getType());
        }
        List<Transaction> filtered = stream.toList();

        // Calculate aggregate sums and counts
        BigDecimal totalIncome = filtered.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = filtered.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long transactionCount = filtered.size();
        BigDecimal balance = totalIncome.subtract(totalExpense);

        // Group income by category
        java.util.Map<UUID, BigDecimal> incomeByCatMap = filtered.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(java.util.stream.Collectors.groupingBy(
                        Transaction::getCategoryId,
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        List<CategorySummaryDTO> incomeByCategory = incomeByCatMap.entrySet().stream()
                .map(e -> new CategorySummaryDTO(
                        e.getKey(),
                        categoryNameMap.getOrDefault(e.getKey(), "Outros"),
                        e.getValue()
                ))
                .sorted((a, b) -> b.total().compareTo(a.total()))
                .toList();

        // Group expense by category
        java.util.Map<UUID, BigDecimal> expenseByCatMap = filtered.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(java.util.stream.Collectors.groupingBy(
                        Transaction::getCategoryId,
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        List<CategorySummaryDTO> expenseByCategory = expenseByCatMap.entrySet().stream()
                .map(e -> new CategorySummaryDTO(
                        e.getKey(),
                        categoryNameMap.getOrDefault(e.getKey(), "Outros"),
                        e.getValue()
                ))
                .sorted((a, b) -> b.total().compareTo(a.total()))
                .toList();

        // Group by year and month for monthly summary
        record YearMonthKey(int year, int month) {}
        java.util.Map<YearMonthKey, BigDecimal> monthlyIncomeMap = filtered.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .collect(java.util.stream.Collectors.groupingBy(
                        t -> new YearMonthKey(t.getDate().getYear(), t.getDate().getMonthValue()),
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        java.util.Map<YearMonthKey, BigDecimal> monthlyExpenseMap = filtered.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(java.util.stream.Collectors.groupingBy(
                        t -> new YearMonthKey(t.getDate().getYear(), t.getDate().getMonthValue()),
                        java.util.stream.Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        java.util.Set<YearMonthKey> allKeys = new java.util.HashSet<>();
        allKeys.addAll(monthlyIncomeMap.keySet());
        allKeys.addAll(monthlyExpenseMap.keySet());

        List<MonthlySummaryDTO> monthlySummary = allKeys.stream()
                .map(k -> new MonthlySummaryDTO(
                        k.year,
                        k.month,
                        monthlyIncomeMap.getOrDefault(k, BigDecimal.ZERO),
                        monthlyExpenseMap.getOrDefault(k, BigDecimal.ZERO)
                ))
                .sorted((a, b) -> {
                    if (a.year() != b.year()) return a.year() - b.year();
                    return a.month() - b.month();
                })
                .toList();

        // Get top 5 expenses
        List<TopExpenseDTO> topExpenses = filtered.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .limit(5)
                .map(t -> new TopExpenseDTO(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getCategoryId(),
                        categoryNameMap.getOrDefault(t.getCategoryId(), "Outros"),
                        t.getDate()
                ))
                .toList();

        // Get 10 recent transactions
        List<RecentTransactionDTO> recentTransactions = filtered.stream()
                .limit(10)
                .map(t -> new RecentTransactionDTO(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getType(),
                        t.getCategoryId(),
                        categoryNameMap.getOrDefault(t.getCategoryId(), "Outros"),
                        t.getDate()
                ))
                .toList();

        // Monthly reference income
        LocalDate referenceDate = endDate != null ? endDate : LocalDate.now();
        int year = referenceDate.getYear();
        int month = referenceDate.getMonthValue();

        BigDecimal monthlyIncome = monthlyIncomeRepository
                .findByUserIdAndYearAndMonth(userId, year, month)
                .map(com.finflow.financeservice.model.MonthlyIncome::getAmount)
                .orElse(BigDecimal.ZERO);

        BigDecimal availableValue = monthlyIncome.subtract(totalExpense);

        BigDecimal committedPercentage = BigDecimal.ZERO;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            committedPercentage = totalExpense
                    .multiply(BigDecimal.valueOf(100))
                    .divide(monthlyIncome, 2, java.math.RoundingMode.HALF_UP);
        }

        List<CardResponseDTO> cardsSummary = cardService.findAll();

        return new DashboardResponseDTO(
                totalIncome,
                totalExpense,
                balance,
                transactionCount,
                incomeByCategory,
                expenseByCategory,
                monthlySummary,
                topExpenses,
                recentTransactions,
                monthlyIncome,
                availableValue,
                committedPercentage,
                cardsSummary
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
