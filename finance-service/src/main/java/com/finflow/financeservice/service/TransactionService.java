
package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.TransactionRequestDTO;
import com.finflow.financeservice.dto.TransactionResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.TransactionMapper;
import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import com.finflow.financeservice.repository.CardRepository;
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
    private final CardRepository cardRepository;

    @Transactional
    public TransactionResponseDTO create(TransactionRequestDTO request) {

        UUID userId = getAuthenticatedUserId();

        validateCategory(request.categoryId(), userId);
        validateCard(request.cardId(), request.type(), userId);
        validateCardLimit(request.cardId(), request.type(), request.amount(), null, userId);

        Transaction transaction = new Transaction();

        transaction.setUserId(userId);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setCardId(request.cardId());
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
        validateCard(request.cardId(), request.type(), userId);
        validateCardLimit(request.cardId(), request.type(), request.amount(), id, userId);

        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setCardId(request.cardId());
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

    private void validateCard(
            UUID cardId,
            com.finflow.financeservice.model.TransactionType type,
            UUID userId
    ) {
        if (cardId == null) {
            return;
        }

        if (type == com.finflow.financeservice.model.TransactionType.INCOME) {
            throw new IllegalArgumentException(
                    "Receitas não podem ser associadas a um cartão de crédito."
            );
        }

        var card = cardRepository
                .findById(cardId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cartão não encontrado."
                        )
                );

        if (!card.getUserId().equals(userId)) {
            throw new AccessDeniedException(
                    "Você não tem acesso a este cartão de crédito."
            );
        }
    }

    private void validateCardLimit(
            UUID cardId,
            com.finflow.financeservice.model.TransactionType type,
            java.math.BigDecimal amount,
            UUID excludeTransactionId,
            UUID userId
    ) {
        if (cardId == null || type != com.finflow.financeservice.model.TransactionType.EXPENSE) {
            return;
        }

        var card = cardRepository
                .findById(cardId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cartão não encontrado."
                        )
                );

        java.math.BigDecimal used = transactionRepository.sumExpenseByCardId(cardId);

        if (excludeTransactionId != null) {
            var oldTx = transactionRepository.findByIdAndUserId(excludeTransactionId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada."));
            if (oldTx.getCardId() != null && oldTx.getCardId().equals(cardId) && oldTx.getType() == com.finflow.financeservice.model.TransactionType.EXPENSE) {
                used = used.subtract(oldTx.getAmount());
            }
        }

        java.math.BigDecimal newTotal = used.add(amount);
        if (newTotal.compareTo(card.getCreditLimit()) > 0) {
            java.math.BigDecimal available = card.getCreditLimit().subtract(used);
            throw new IllegalArgumentException(
                    "Esta despesa ultrapassa o limite disponível do cartão. Limite disponível: R$ " + available
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

