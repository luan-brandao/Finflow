package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CategoryRequestDTO;
import com.finflow.financeservice.dto.CategoryResponseDTO;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.CategoryMapper;
import com.finflow.financeservice.model.Category;
import com.finflow.financeservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO request) {

        UUID userId = getAuthenticatedUserId();

        if (categoryRepository.existsByNameAndUserId(
                request.name(),
                userId
        )) {
            throw new IllegalArgumentException(
                    "Você já possui uma categoria com esse nome."
            );
        }

        Category category = new Category();

        category.setName(request.name());
        category.setUserId(userId);
        category.setDefault(false);

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponseDTO(savedCategory);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAll() {

        UUID userId = getAuthenticatedUserId();

        return categoryRepository
                .findByUserIdIsNullOrUserId(userId)
                .stream()
                .map(categoryMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO findById(UUID id) {

        UUID userId = getAuthenticatedUserId();

        Category category = categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Categoria não encontrada."
                        )
                );

        validateAccess(category, userId);

        return categoryMapper.toResponseDTO(category);
    }

    @Transactional
    public CategoryResponseDTO update(
            UUID id,
            CategoryRequestDTO request
    ) {

        UUID userId = getAuthenticatedUserId();

        Category category = categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Categoria não encontrada."
                        )
                );

        validateAccess(category, userId);

        if (categoryRepository.existsByNameAndUserId(
                request.name(),
                userId
        ) && !category.getName().equals(request.name())) {

            throw new IllegalArgumentException(
                    "Você já possui uma categoria com esse nome."
            );
        }

        category.setName(request.name());

        Category updatedCategory = categoryRepository.save(category);

        return categoryMapper.toResponseDTO(updatedCategory);
    }

    @Transactional
    public void delete(UUID id) {

        UUID userId = getAuthenticatedUserId();

        Category category = categoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Categoria não encontrada."
                        )
                );

        validateAccess(category, userId);

        categoryRepository.delete(category);
    }

    private UUID getAuthenticatedUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return UUID.fromString(authentication.getName());
    }

    private void validateAccess(
            Category category,
            UUID userId
    ) {

        if (category.isDefault()) {
            throw new IllegalArgumentException(
                    "Categorias padrão não podem ser alteradas ou excluídas."
            );
        }

        if (!userId.equals(category.getUserId())) {
            throw new IllegalArgumentException(
                    "Você não possui permissão para acessar esta categoria."
            );
        }
    }
}