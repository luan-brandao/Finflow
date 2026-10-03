
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
import com.finflow.financeservice.repository.GoalRepository;
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
    private final GoalRepository goalRepository;
    private final EventPublisherService eventPublisherService;
    private final com.finflow.financeservice.repository.CategoryBudgetRepository categoryBudgetRepository;

    @Transactional
    public TransactionResponseDTO create(TransactionRequestDTO request) {

        UUID userId = getAuthenticatedUserId();

        validateCategory(request.categoryId(), userId);
        validateCard(request.cardId(), request.type(), userId);
        validateGoal(request.goalId(), userId);
        validateCardLimit(request.cardId(), request.type(), request.amount(), null, userId);

        Transaction transaction = new Transaction();

        transaction.setUserId(userId);
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setCardId(request.cardId());
        transaction.setGoalId(request.goalId());
        transaction.setDate(request.date());

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        updateGoalAmountOnCreate(request.goalId(), request.amount(), request.type());

        if (request.type() == com.finflow.financeservice.model.TransactionType.EXPENSE) {
            checkCategoryBudgetLimits(userId, request.categoryId(), request.date());
        }

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
        validateGoal(request.goalId(), userId);
        validateCardLimit(request.cardId(), request.type(), request.amount(), id, userId);

        UUID oldGoalId = transaction.getGoalId();
        java.math.BigDecimal oldAmount = transaction.getAmount();
        com.finflow.financeservice.model.TransactionType oldType = transaction.getType();

        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(request.type());
        transaction.setCategoryId(request.categoryId());
        transaction.setCardId(request.cardId());
        transaction.setGoalId(request.goalId());
        transaction.setDate(request.date());

        Transaction updatedTransaction =
                transactionRepository.save(transaction);

        updateGoalAmountOnDelete(oldGoalId, oldAmount, oldType);
        updateGoalAmountOnCreate(request.goalId(), request.amount(), request.type());

        if (request.type() == com.finflow.financeservice.model.TransactionType.EXPENSE) {
            checkCategoryBudgetLimits(userId, request.categoryId(), request.date());
        }

        return transactionMapper.toResponseDTO(updatedTransaction);
    }

    @Transactional
    public void delete(UUID id) {

        UUID userId = getAuthenticatedUserId();

        Transaction transaction = findUserTransaction(id, userId);

        UUID goalId = transaction.getGoalId();
        java.math.BigDecimal amount = transaction.getAmount();
        com.finflow.financeservice.model.TransactionType type = transaction.getType();

        transactionRepository.delete(transaction);

        updateGoalAmountOnDelete(goalId, amount, type);
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

    private void validateGoal(UUID goalId, UUID userId) {
        if (goalId == null) {
            return;
        }
        var goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Você não tem acesso a esta meta.");
        }
    }

    private void updateGoalAmountOnCreate(UUID goalId, java.math.BigDecimal amount, com.finflow.financeservice.model.TransactionType type) {
        if (goalId == null) return;
        var goal = goalRepository.findById(goalId).orElse(null);
        if (goal != null) {
            if (type == com.finflow.financeservice.model.TransactionType.INCOME) {
                goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
            } else {
                goal.setCurrentAmount(goal.getCurrentAmount().subtract(amount));
            }

            if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0 && !goal.isReachedNotified()) {
                boolean early = !java.time.LocalDate.now().isAfter(goal.getTargetDate());
                String eventType = early ? "GOAL_REACHED_EARLY" : "GOAL_REACHED";
                String routingKey = early ? "finance.goal.reached.early" : "finance.goal.reached";

                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("goalId", goal.getId());
                payload.put("goalTitle", goal.getTitle());
                payload.put("currentAmount", goal.getCurrentAmount());
                payload.put("targetAmount", goal.getTargetAmount());
                payload.put("targetDate", goal.getTargetDate().toString());

                eventPublisherService.publishEvent(routingKey, eventType, goal.getUserId(), payload);
                goal.setReachedNotified(true);
            }

            goalRepository.save(goal);
        }
    }

    private void updateGoalAmountOnDelete(UUID goalId, java.math.BigDecimal amount, com.finflow.financeservice.model.TransactionType type) {
        if (goalId == null) return;
        var goal = goalRepository.findById(goalId).orElse(null);
        if (goal != null) {
            if (type == com.finflow.financeservice.model.TransactionType.INCOME) {
                goal.setCurrentAmount(goal.getCurrentAmount().subtract(amount));
            } else {
                goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
            }
            goalRepository.save(goal);
        }
    }

    private void checkCategoryBudgetLimits(UUID userId, UUID categoryId, java.time.LocalDate date) {
        if (categoryId == null) return;
        var budgetOpt = categoryBudgetRepository.findByCategoryId(categoryId);
        if (budgetOpt.isEmpty()) return;
        var budget = budgetOpt.get();

        java.time.LocalDate startOfMonth = date.withDayOfMonth(1);
        java.time.LocalDate endOfMonth = date.withDayOfMonth(date.lengthOfMonth());

        List<com.finflow.financeservice.model.Transaction> txs = transactionRepository.findByUserIdAndPeriod(userId, startOfMonth, endOfMonth);
        java.math.BigDecimal total = txs.stream()
                .filter(t -> categoryId.equals(t.getCategoryId()))
                .filter(t -> t.getType() == com.finflow.financeservice.model.TransactionType.EXPENSE)
                .map(com.finflow.financeservice.model.Transaction::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.math.BigDecimal limit = budget.getLimitAmount();
        if (limit.compareTo(java.math.BigDecimal.ZERO) <= 0) return;

        java.math.BigDecimal ratio = total.divide(limit, 4, java.math.RoundingMode.HALF_UP);
        
        var category = categoryRepository.findById(categoryId).orElse(null);
        String categoryName = category != null ? category.getName() : "Categoria";

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("categoryId", categoryId);
        payload.put("categoryName", categoryName);
        payload.put("budgetLimit", limit);
        payload.put("currentUsage", total);

        if (total.compareTo(limit) > 0 && !budget.isNotifiedOver()) {
            payload.put("percentage", ratio.multiply(java.math.BigDecimal.valueOf(100)).intValue());
            eventPublisherService.publishEvent("finance.budget.threshold", "BUDGET_EXCEEDED", userId, payload);
            budget.setNotifiedOver(true);
            categoryBudgetRepository.save(budget);
        } else if (total.compareTo(limit) == 0 && !budget.isNotified100()) {
            payload.put("percentage", 100);
            eventPublisherService.publishEvent("finance.budget.threshold", "BUDGET_PERCENT_100", userId, payload);
            budget.setNotified100(true);
            categoryBudgetRepository.save(budget);
        } else if (ratio.compareTo(java.math.BigDecimal.valueOf(0.80)) >= 0 && total.compareTo(limit) < 0 && !budget.isNotified80()) {
            payload.put("percentage", ratio.multiply(java.math.BigDecimal.valueOf(100)).intValue());
            eventPublisherService.publishEvent("finance.budget.threshold", "BUDGET_PERCENT_80", userId, payload);
            budget.setNotified80(true);
            categoryBudgetRepository.save(budget);
        }
    }
}

