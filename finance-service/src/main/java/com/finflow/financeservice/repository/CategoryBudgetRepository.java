package com.finflow.financeservice.repository;

import com.finflow.financeservice.model.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, UUID> {

    Optional<CategoryBudget> findByCategoryId(UUID categoryId);

    List<CategoryBudget> findByUserId(UUID userId);
}
