package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.GoalMapper;
import com.finflow.financeservice.model.Goal;
import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.repository.GoalRepository;
import com.finflow.financeservice.repository.TransactionRepository;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private GoalMapper goalMapper;

    @InjectMocks
    private GoalService goalService;

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
    void shouldCreateGoalSuccessfully() {
        GoalRequestDTO request = new GoalRequestDTO("Comprar Carro", new BigDecimal("50000.00"), new BigDecimal("10000.00"), LocalDate.now().plusYears(1), "ACTIVE");
        Goal goal = new Goal();
        goal.setTitle("Comprar Carro");
        goal.setTargetAmount(new BigDecimal("50000.00"));
        goal.setCurrentAmount(new BigDecimal("10000.00"));
        goal.setStatus("ACTIVE");

        Goal savedGoal = new Goal();
        savedGoal.setId(UUID.randomUUID());
        savedGoal.setUserId(userId);
        savedGoal.setTitle("Comprar Carro");
        savedGoal.setTargetAmount(new BigDecimal("50000.00"));
        savedGoal.setCurrentAmount(new BigDecimal("10000.00"));
        savedGoal.setStatus("ACTIVE");

        GoalResponseDTO expectedResponse = new GoalResponseDTO(
                savedGoal.getId(),
                userId,
                "Comprar Carro",
                new BigDecimal("50000.00"),
                new BigDecimal("10000.00"),
                savedGoal.getTargetDate(),
                "ACTIVE",
                LocalDateTime.now()
        );

        when(goalMapper.toEntity(request)).thenReturn(goal);
        when(goalRepository.save(goal)).thenReturn(savedGoal);
        when(goalMapper.toDTO(savedGoal)).thenReturn(expectedResponse);

        GoalResponseDTO response = goalService.create(request);

        assertNotNull(response);
        assertEquals("Comprar Carro", response.title());
        assertEquals(new BigDecimal("50000.00"), response.targetAmount());
        assertEquals(userId, goal.getUserId());
        assertEquals("ACTIVE", goal.getStatus());
    }

    @Test
    void shouldFindAllGoalsForAuthenticatedUser() {
        Goal goal1 = new Goal();
        goal1.setUserId(userId);
        Goal goal2 = new Goal();
        goal2.setUserId(userId);

        GoalResponseDTO dto1 = mock(GoalResponseDTO.class);
        GoalResponseDTO dto2 = mock(GoalResponseDTO.class);

        when(goalRepository.findByUserId(userId)).thenReturn(List.of(goal1, goal2));
        when(goalMapper.toDTO(goal1)).thenReturn(dto1);
        when(goalMapper.toDTO(goal2)).thenReturn(dto2);

        List<GoalResponseDTO> result = goalService.findAll();

        assertEquals(2, result.size());
        verify(goalRepository).findByUserId(userId);
    }

    @Test
    void shouldFindGoalByIdSuccessfully() {
        UUID goalId = UUID.randomUUID();
        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);

        GoalResponseDTO dto = mock(GoalResponseDTO.class);

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        when(goalMapper.toDTO(goal)).thenReturn(dto);

        GoalResponseDTO result = goalService.findById(goalId);

        assertNotNull(result);
        verify(goalRepository).findById(goalId);
    }

    @Test
    void shouldThrowExceptionWhenGoalNotFoundById() {
        UUID goalId = UUID.randomUUID();
        when(goalRepository.findById(goalId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> goalService.findById(goalId));
    }

    @Test
    void shouldThrowExceptionWhenAccessDeniedToGoal() {
        UUID goalId = UUID.randomUUID();
        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(UUID.randomUUID()); // Different user

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        assertThrows(AccessDeniedException.class, () -> goalService.findById(goalId));
    }

    @Test
    void shouldUpdateGoalSuccessfully() {
        UUID goalId = UUID.randomUUID();
        GoalRequestDTO request = new GoalRequestDTO("Viagem Japão", new BigDecimal("20000.00"), new BigDecimal("5000.00"), LocalDate.now().plusMonths(6), "ACTIVE");
        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);
        goal.setTitle("Viagem Antiga");

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        when(goalRepository.save(goal)).thenReturn(goal);
        when(goalMapper.toDTO(goal)).thenReturn(mock(GoalResponseDTO.class));

        goalService.update(goalId, request);

        verify(goalMapper).updateEntity(request, goal);
        verify(goalRepository).save(goal);
    }

    @Test
    void shouldDeleteGoalAndEstornoSuccessfully() {
        UUID goalId = UUID.randomUUID();
        Goal goal = new Goal();
        goal.setId(goalId);
        goal.setUserId(userId);
        goal.setTitle("Meta Carro");
        goal.setCurrentAmount(new BigDecimal("5000.00")); // has 5000.00 saved

        when(goalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        when(transactionRepository.findByGoalId(goalId)).thenReturn(new ArrayList<>()); // no transactions associated
        when(categoryRepository.findByUserIdIsNullOrUserId(userId)).thenReturn(new ArrayList<>()); // standard category search

        goalService.delete(goalId);

        // verify that an estorno transaction was created with the correct amount
        verify(transactionRepository).save(argThat(tx -> 
            tx.getUserId().equals(userId) &&
            tx.getAmount().equals(new BigDecimal("5000.00")) &&
            tx.getDescription().contains("Estorno de saldo - Meta: Meta Carro")
        ));
        verify(goalRepository).delete(goal);
    }
}
