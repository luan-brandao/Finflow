
package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.TransactionRequestDTO;
import com.finflow.financeservice.dto.TransactionResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.TransactionMapper;
import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CategoryRepository categoryRepository;

    @Transactional
    public TransactionResponseDTO create(TransactionRequestDTO request) {

        UUID userId = getAuthenticatedUserId();

        validateCategory(request.categoryId(), userId);

        Transaction transaction = new Transaction();

        transaction.setUserId(userId);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setDate(request.date());

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return transactionMapper.toResponseDTO(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> findAll() {

        UUID userId = getAuthenticatedUserId();

        return transactionRepository
                .findByUserId(userId)
                .stream()
                .map(transactionMapper::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponseDTO findById(UUID id) {

        UUID userId = getAuthenticatedUserId();

        Transaction transaction = findUserTransaction(id, userId);

        return transactionMapper.toResponseDTO(transaction);
    }

    @Transactional
    public TransactionResponseDTO update(
            UUID id,
            TransactionRequestDTO request
    ) {

        UUID userId = getAuthenticatedUserId();

        Transaction transaction = findUserTransaction(id, userId);

        validateCategory(request.categoryId(), userId);

        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setDate(request.date());

        Transaction updatedTransaction =
                transactionRepository.save(transaction);

        return transactionMapper.toResponseDTO(updatedTransaction);
    }

    @Transactional
    public void delete(UUID id) {

        UUID userId = getAuthenticatedUserId();

        Transaction transaction = findUserTransaction(id, userId);

        transactionRepository.delete(transaction);
    }

    private void validateCategory(
            UUID categoryId,
            UUID userId
    ) {

        var category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Categoria não encontrada."
                        )
                );

        if (category.isDefault()) {
            return;
        }

        if (!category.getUserId().equals(userId)) {
            throw new AccessDeniedException(
                    "Você não tem acesso a esta categoria."
            );
        }
    }

    private Transaction findUserTransaction(
            UUID id,
            UUID userId
    ) {

        return transactionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transação não encontrada."
                        )
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

