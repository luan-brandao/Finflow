package com.finflow.financeservice.repository;

import com.finflow.financeservice.model.MonthlyIncome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MonthlyIncomeRepository extends JpaRepository<MonthlyIncome, UUID> {

    Optional<MonthlyIncome> findByUserIdAndYearAndMonth(UUID userId, int year, int month);

    List<MonthlyIncome> findByUserIdOrderByYearDescMonthDesc(UUID userId);

    boolean existsByUserIdAndYearAndMonth(UUID userId, int year, int month);
}
