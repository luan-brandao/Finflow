package com.finflow.financeservice.integration;

import com.finflow.financeservice.TestcontainersConfiguration;
import com.finflow.financeservice.dto.CardRequestDTO;
import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.dto.GoalRequestDTO;
import com.finflow.financeservice.dto.GoalResponseDTO;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.GoalRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import com.finflow.financeservice.service.CardService;
import com.finflow.financeservice.service.GoalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
class FinanceServiceIntegrationTest {

    @Autowired
    private CardService cardService;

    @Autowired
    private GoalService goalService;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CardInvoiceRepository cardInvoiceRepository;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        setAuthenticatedUser(userId);
        transactionRepository.deleteAll();
        cardInvoiceRepository.deleteAll();
        cardRepository.deleteAll();
        goalRepository.deleteAll();
    }

    private void setAuthenticatedUser(UUID userId) {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId.toString());
    }

    @Test
    void shouldCreateCardAndFindAll() {
        CardRequestDTO request = new CardRequestDTO("Visa Gold", new BigDecimal("3500.00"), 12);
        CardResponseDTO created = cardService.create(request);

        assertThat(created).isNotNull();
        assertThat(created.name()).isEqualTo("Visa Gold");
        assertThat(created.creditLimit()).isEqualByComparingTo("3500.00");

        List<CardResponseDTO> list = cardService.findAll();
        assertThat(list).hasSize(1);
        assertThat(list.get(0).id()).isEqualTo(created.id());
    }

    @Test
    void shouldCreateGoalAndUpdateIt() {
        GoalRequestDTO request = new GoalRequestDTO(
                "Estudos",
                new BigDecimal("1000.00"),
                BigDecimal.ZERO,
                LocalDate.now().plusMonths(6),
                "ACTIVE"
        );

        GoalResponseDTO created = goalService.create(request);
        assertThat(created).isNotNull();
        assertThat(created.title()).isEqualTo("Estudos");

        GoalRequestDTO updateRequest = new GoalRequestDTO(
                "Estudos Avançados",
                new BigDecimal("1500.00"),
                BigDecimal.ZERO,
                LocalDate.now().plusMonths(6),
                "ACTIVE"
        );

        GoalResponseDTO updated = goalService.update(created.id(), updateRequest);
        assertThat(updated.title()).isEqualTo("Estudos Avançados");
        assertThat(updated.targetAmount()).isEqualByComparingTo("1500.00");
    }
}
