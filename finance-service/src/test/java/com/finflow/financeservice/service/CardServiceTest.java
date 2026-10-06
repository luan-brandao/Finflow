package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CardRequestDTO;
import com.finflow.financeservice.dto.CardResponseDTO;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.CardMapper;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.CardRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CardInvoiceRepository cardInvoiceRepository;

    @Mock
    private CardMapper cardMapper;

    @InjectMocks
    private CardService cardService;

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
    void shouldCreateCardSuccessfully() {
        CardRequestDTO request = new CardRequestDTO("Visa Platinum", new BigDecimal("5000.00"), 10);
        Card card = new Card();
        card.setUserId(userId);
        card.setName("Visa Platinum");
        card.setCreditLimit(new BigDecimal("5000.00"));
        card.setDueDay(10);

        when(cardRepository.save(any(Card.class))).thenReturn(card);
        when(cardMapper.toResponseDTO(eq(card), eq(BigDecimal.ZERO), eq(new BigDecimal("5000.00"))))
                .thenReturn(mock(CardResponseDTO.class));

        CardResponseDTO response = cardService.create(request);

        assertNotNull(response);
        verify(cardRepository).save(any(Card.class));
    }

    @Test
    void shouldThrowExceptionWhenCreditLimitIsNegativeOnCreate() {
        CardRequestDTO request = new CardRequestDTO("Visa Platinum", new BigDecimal("-100.00"), 10);

        assertThrows(IllegalArgumentException.class, () -> cardService.create(request));
        verify(cardRepository, never()).save(any(Card.class));
    }

    @Test
    void shouldFindAllCardsForAuthenticatedUser() {
        Card card1 = new Card();
        card1.setId(UUID.randomUUID());
        card1.setUserId(userId);
        card1.setPrepaidAmount(BigDecimal.ZERO);
        card1.setCreditLimit(new BigDecimal("2000.00"));

        when(cardRepository.findByUserId(userId)).thenReturn(List.of(card1));
        when(transactionRepository.sumExpenseByCardId(card1.getId())).thenReturn(new BigDecimal("500.00"));
        when(cardInvoiceRepository.sumPaidInvoicesByCardId(card1.getId())).thenReturn(new BigDecimal("100.00"));
        when(cardMapper.toResponseDTO(eq(card1), any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(mock(CardResponseDTO.class));

        List<CardResponseDTO> result = cardService.findAll();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void shouldFindCardByIdSuccessfully() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);
        card.setPrepaidAmount(BigDecimal.ZERO);
        card.setCreditLimit(new BigDecimal("2000.00"));

        when(cardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.of(card));
        when(transactionRepository.sumExpenseByCardId(cardId)).thenReturn(new BigDecimal("500.00"));
        when(cardInvoiceRepository.sumPaidInvoicesByCardId(cardId)).thenReturn(new BigDecimal("100.00"));
        when(cardMapper.toResponseDTO(eq(card), any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(mock(CardResponseDTO.class));

        CardResponseDTO result = cardService.findById(cardId);

        assertNotNull(result);
    }

    @Test
    void shouldThrowExceptionWhenCardNotFound() {
        UUID cardId = UUID.randomUUID();
        when(cardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cardService.findById(cardId));
    }

    @Test
    void shouldPayAdvanceSuccessfully() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);
        card.setPrepaidAmount(new BigDecimal("200.00"));
        card.setCreditLimit(new BigDecimal("5000.00"));

        when(cardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.of(card));
        when(cardRepository.save(card)).thenReturn(card);
        when(transactionRepository.sumExpenseByCardId(cardId)).thenReturn(new BigDecimal("1000.00"));
        when(cardInvoiceRepository.sumPaidInvoicesByCardId(cardId)).thenReturn(new BigDecimal("200.00"));
        when(cardMapper.toResponseDTO(eq(card), any(BigDecimal.class), any(BigDecimal.class)))
                .thenReturn(mock(CardResponseDTO.class));

        CardResponseDTO result = cardService.payAdvance(cardId, new BigDecimal("300.00"));

        assertNotNull(result);
        assertEquals(new BigDecimal("500.00"), card.getPrepaidAmount()); // 200.00 + 300.00
        verify(cardRepository).save(card);
    }

    @Test
    void shouldThrowExceptionWhenPrepaymentIsZeroOrNegative() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);

        when(cardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.of(card));

        assertThrows(IllegalArgumentException.class, () -> cardService.payAdvance(cardId, BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () -> cardService.payAdvance(cardId, new BigDecimal("-50.00")));
    }
}
