package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.DashboardResponseDTO;
import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.model.TransactionCategory;
import com.finflow.financeservice.model.TransactionType;
import com.finflow.financeservice.repository.CategoryRepository;
import com.finflow.financeservice.repository.MonthlyIncomeRepository;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private MonthlyIncomeRepository monthlyIncomeRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CardService cardService;

    @InjectMocks
    private DashboardService dashboardService;

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
    void shouldGetDashboardSuccessfully() {
        LocalDate start = LocalDate.now().minusMonths(1);
        LocalDate end = LocalDate.now();

        UUID categoryId = UUID.randomUUID();
        TransactionCategory category = new TransactionCategory();
        category.setId(categoryId);
        category.setName("Alimentação");

        Transaction tx1 = new Transaction();
        tx1.setId(UUID.randomUUID());
        tx1.setUserId(userId);
        tx1.setType(TransactionType.INCOME);
        tx1.setAmount(new BigDecimal("3000.00"));
        tx1.setCategoryId(categoryId);
        tx1.setDate(LocalDate.now());

        Transaction tx2 = new Transaction();
        tx2.setId(UUID.randomUUID());
        tx2.setUserId(userId);
        tx2.setType(TransactionType.EXPENSE);
        tx2.setAmount(new BigDecimal("500.00"));
        tx2.setCategoryId(categoryId);
        tx2.setDate(LocalDate.now());

        when(transactionRepository.findByUserIdAndPeriod(userId, start, end)).thenReturn(List.of(tx1, tx2));
        when(categoryRepository.findByUserIdIsNullOrUserId(userId)).thenReturn(List.of(category));
        when(monthlyIncomeRepository.findByUserIdAndYearAndMonth(userId, end.getYear(), end.getMonthValue()))
                .thenReturn(Optional.empty());
        when(cardService.findAll()).thenReturn(new ArrayList<>());

        DashboardResponseDTO response = dashboardService.getDashboard(start, end, null, null, null, null);

        assertNotNull(response);
        assertEquals(new BigDecimal("3000.00"), response.totalIncome());
        assertEquals(new BigDecimal("500.00"), response.totalExpense());
        assertEquals(new BigDecimal("2500.00"), response.balance());
        assertEquals(2, response.transactionCount());
        assertFalse(response.expenseByCategory().isEmpty());
        assertEquals("Alimentação", response.expenseByCategory().get(0).categoryName());
    }
}
