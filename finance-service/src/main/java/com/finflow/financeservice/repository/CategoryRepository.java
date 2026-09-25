package com.finflow.financeservice.repository;

import com.finflow.financeservice.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    boolean existsByNameAndUserId(String name, UUID userId);

    List<Category> findByUserIdIsNullOrUserId(UUID userId);

}