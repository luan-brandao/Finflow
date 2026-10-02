package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.GoalMapper;
import com.finflow.financeservice.model.Goal;
import com.finflow.financeservice.repository.GoalRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final GoalMapper goalMapper;

    @Transactional
    public GoalResponseDTO create(GoalRequestDTO request) {
        UUID userId = getAuthenticatedUserId();

        Goal goal = goalMapper.toEntity(request);
        goal.setUserId(userId);

        Goal savedGoal = goalRepository.save(goal);
        return goalMapper.toDTO(savedGoal);
    }

    @Transactional(readOnly = true)
    public List<GoalResponseDTO> findAll() {
        UUID userId = getAuthenticatedUserId();
        return goalRepository.findByUserId(userId)
                .stream()
                .map(goalMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public GoalResponseDTO findById(UUID id) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        return goalMapper.toDTO(goal);
    }

    @Transactional
    public GoalResponseDTO update(UUID id, GoalRequestDTO request) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        goalMapper.updateEntity(request, goal);
        Goal updatedGoal = goalRepository.save(goal);
        return goalMapper.toDTO(updatedGoal);
    }

    @Transactional
    public void delete(UUID id) {
        UUID userId = getAuthenticatedUserId();
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));

        if (!goal.getUserId().equals(userId)) {
            throw new AccessDeniedException("Acesso negado a esta meta.");
        }

        // 1. Fetch transactions associated with this goal
        List<Transaction> goalTxs = transactionRepository.findByGoalId(goal.getId());
        
        // 2. Set goalId to null so they revert back to standard available cash
        java.math.BigDecimal sumTxs = java.math.BigDecimal.ZERO;
        for (Transaction tx : goalTxs) {
            tx.setGoalId(null);
            if (tx.getType() == com.finflow.financeservice.model.TransactionType.INCOME) {
                sumTxs = sumTxs.add(tx.getAmount());
            } else if (tx.getType() == com.finflow.financeservice.model.TransactionType.EXPENSE) {
                sumTxs = sumTxs.subtract(tx.getAmount());
            }
            transactionRepository.save(tx);
        }

        // 3. If there is a remaining positive current amount that wasn't represented by these transactions,
        // we create a general INCOME transaction to refund the exact difference to the user's available money.
        java.math.BigDecimal diff = goal.getCurrentAmount().subtract(sumTxs);
        if (diff.compareTo(java.math.BigDecimal.ZERO) > 0) {
            Transaction estorno = new Transaction();
            estorno.setUserId(userId);
            estorno.setDescription("Estorno de saldo - Meta: " + goal.getTitle());
            estorno.setAmount(diff);
            estorno.setType(com.finflow.financeservice.model.TransactionType.INCOME);
            
            // Find user category or standard category
            var categories = categoryRepository.findByUserIdIsNullOrUserId(userId);
            UUID catId = categories.isEmpty() ? UUID.randomUUID() : categories.get(0).getId();
            estorno.setCategoryId(catId);
            estorno.setDate(java.time.LocalDate.now());
            
            transactionRepository.save(estorno);
        }

        goalRepository.delete(goal);
    }

    private UUID getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado.");
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new AccessDeniedException("Usuário autenticado inválido.");
        }
    }
}
