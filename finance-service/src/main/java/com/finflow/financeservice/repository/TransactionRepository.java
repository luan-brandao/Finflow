package com.finflow.financeservice.repository;

import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.projection.CategorySummaryProjection;
import com.finflow.financeservice.projection.MonthlySummaryProjection;
import com.finflow.financeservice.projection.RecentTransactionProjection;
import com.finflow.financeservice.projection.TopExpenseProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserId(UUID userId);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.userId = :userId
              AND t.type = com.finflow.financeservice.model.TransactionType.INCOME
              AND t.date BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumIncomeByUserIdAndPeriod(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.userId = :userId
              AND t.type = com.finflow.financeservice.model.TransactionType.EXPENSE
              AND t.date BETWEEN :startDate AND :endDate
            """)
    BigDecimal sumExpenseByUserIdAndPeriod(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
            SELECT COUNT(t)
            FROM Transaction t
            WHERE t.userId = :userId
              AND t.date BETWEEN :startDate AND :endDate
            """)
    long countByUserIdAndPeriod(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT
                c.id AS categoryId,
                c.name AS categoryName,
                SUM(t.amount) AS total
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.type = 'INCOME'
              AND t.date BETWEEN :startDate AND :endDate
            GROUP BY c.id, c.name
            ORDER BY total DESC
            """, nativeQuery = true)
    List<CategorySummaryProjection> sumIncomeByCategory(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT
                c.id AS categoryId,
                c.name AS categoryName,
                SUM(t.amount) AS total
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.type = 'EXPENSE'
              AND t.date BETWEEN :startDate AND :endDate
            GROUP BY c.id, c.name
            ORDER BY total DESC
            """, nativeQuery = true)
    List<CategorySummaryProjection> sumExpenseByCategory(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT
                EXTRACT(YEAR FROM t.date)::INTEGER AS year,
                EXTRACT(MONTH FROM t.date)::INTEGER AS month,
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.type = 'INCOME' THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS totalIncome,
                COALESCE(
                    SUM(
                        CASE
                            WHEN t.type = 'EXPENSE' THEN t.amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS totalExpense
            FROM transactions t
            WHERE t.user_id = :userId
              AND t.date BETWEEN :startDate AND :endDate
            GROUP BY
                EXTRACT(YEAR FROM t.date),
                EXTRACT(MONTH FROM t.date)
            ORDER BY year, month
            """, nativeQuery = true)
    List<MonthlySummaryProjection> findMonthlySummary(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query(value = """
            SELECT
                t.id AS transactionId,
                t.description AS description,
                t.amount AS amount,
                t.category_id AS categoryId,
                c.name AS categoryName,
                t.date AS date
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.type = 'EXPENSE'
              AND t.date BETWEEN :startDate AND :endDate
            ORDER BY t.amount DESC
            """, nativeQuery = true)
    List<TopExpenseProjection> findTopExpenses(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query(value = """
            SELECT
                t.id AS transactionId,
                t.description AS description,
                t.amount AS amount,
                t.type AS type,
                t.category_id AS categoryId,
                c.name AS categoryName,
                t.date AS date
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.date BETWEEN :startDate AND :endDate
            ORDER BY t.date DESC, t.created_at DESC
            """, nativeQuery = true)
    List<RecentTransactionProjection> findRecentTransactions(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}