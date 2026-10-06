package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.TransactionRequestDTO;
import com.finflow.financeservice.dto.TransactionResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.mapper.TransactionMapper;
import com.finflow.financeservice.model.*;
import com.finflow.financeservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private EventPublisherService eventPublisherService;

    @Mock
    private CategoryBudgetRepository categoryBudgetRepository;

    @InjectMocks
    private TransactionService transactionService;

    private UUID userId;
    private SecurityContext securityContext;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        securityContext = mock(SecurityContext.class);
        authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId.toString());
    }

    @Test
    void shouldCreateIncomeTransactionSuccessfully() {
        UUID categoryId = UUID.randomUUID();
        TransactionRequestDTO request = new TransactionRequestDTO(
                "Aporte Mensal",
                new BigDecimal("500.00"),
                TransactionType.INCOME,
                categoryId,
                LocalDate.now(),
                null,
                null
        );

        Category category = new Category();
        category.setId(categoryId);
        category.setUserId(userId);

        Transaction transaction = new Transaction();
        Transaction savedTransaction = new Transaction();
        savedTransaction.setId(UUID.randomUUID());

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);
        when(transactionMapper.toResponseDTO(savedTransaction)).thenReturn(mock(TransactionResponseDTO.class));

        TransactionResponseDTO response = transactionService.create(request);

        assertNotNull(response);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void shouldThrowExceptionWhenWithdrawingMoreThanAvailableInGoal() {
        UUID goalId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        TransactionRequestDTO request = new TransactionRequestDTO(
                "Compra de Peça",
                new BigDecimal("150.00"),
                TransactionType.EXPENSE,
                categoryId,
                LocalDate.now(),
                null,
                goalId
        );

        Category category = new Category();
        category.setId(categoryId);
        category.setUserId(userId);

        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);
        goal.setTitle("Meta Carro");
        goal.setCurrentAmount(new BigDecimal("100.00"));

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            transactionService.create(request);
        });

        assertTrue(exception.getMessage().contains("Não é possível retirar este valor. Saldo disponível na meta \"Meta Carro\""));
    }

    @Test
    void shouldPublishEventWhenGoalIsReached() {
        UUID goalId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        TransactionRequestDTO request = new TransactionRequestDTO(
                "Aporte Extra",
                new BigDecimal("5000.00"),
                TransactionType.INCOME,
                categoryId,
                LocalDate.now(),
                null,
                goalId
        );

        Category category = new Category();
        category.setId(categoryId);
        category.setUserId(userId);

        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);
        goal.setTitle("Meta Carro");
        goal.setTargetAmount(new BigDecimal("10000.00"));
        goal.setCurrentAmount(new BigDecimal("6000.00"));
        goal.setTargetDate(LocalDate.now().plusYears(1));
        goal.setReachedNotified(false);

        Transaction savedTransaction = new Transaction();

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTransaction);

        transactionService.create(request);

        verify(eventPublisherService).publishEvent(
                eq("finance.goal.reached.early"),
                eq("GOAL_REACHED_EARLY"),
                eq(userId),
                anyMap()
        );
        assertTrue(goal.isReachedNotified());
    }

    @Test
    void shouldUpdateGoalAmountOnTransactionDelete() {
        UUID id = UUID.randomUUID();
        UUID goalId = UUID.randomUUID();

        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setUserId(userId);
        transaction.setAmount(new BigDecimal("200.00"));
        transaction.setType(TransactionType.INCOME);
        transaction.setGoalId(goalId);

        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);
        goal.setCurrentAmount(new BigDecimal("1000.00"));

        when(transactionRepository.findByIdAndUserId(id, userId)).thenReturn(Optional.of(transaction));
        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        transactionService.delete(id);

        verify(transactionRepository).delete(transaction);
        assertEquals(new BigDecimal("800.00"), goal.getCurrentAmount());
        verify(goalRepository).save(goal);
    }
}
