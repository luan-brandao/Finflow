package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CardInvoiceResponseDTO;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.mapper.CardInvoiceMapper;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.model.CardInvoice;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.CardRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardInvoiceServiceTest {

    @Mock
    private CardInvoiceRepository cardInvoiceRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private CardInvoiceMapper cardInvoiceMapper;

    @Mock
    private EventPublisherService eventPublisherService;

    @InjectMocks
    private CardInvoiceService cardInvoiceService;

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
    void shouldFindAllInvoicesForAuthenticatedUser() {
        CardInvoice invoice1 = new CardInvoice();
        invoice1.setUserId(userId);
        CardInvoice invoice2 = new CardInvoice();
        invoice2.setUserId(userId);

        CardInvoiceResponseDTO dto1 = mock(CardInvoiceResponseDTO.class);
        CardInvoiceResponseDTO dto2 = mock(CardInvoiceResponseDTO.class);

        when(cardInvoiceRepository.findByUserId(userId)).thenReturn(List.of(invoice1, invoice2));
        when(cardInvoiceMapper.toDTO(invoice1)).thenReturn(dto1);
        when(cardInvoiceMapper.toDTO(invoice2)).thenReturn(dto2);

        List<CardInvoiceResponseDTO> result = cardInvoiceService.findAll();

        assertEquals(2, result.size());
        verify(cardInvoiceRepository).findByUserId(userId);
    }

    @Test
    void shouldPayInvoiceSuccessfully() {
        UUID invoiceId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();

        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);
        card.setLimitAmount(new BigDecimal("5000.00"));
        card.setUsedAmount(new BigDecimal("1000.00")); // has 1000.00 spent

        CardInvoice invoice = new CardInvoice();
        invoice.setId(invoiceId);
        invoice.setUserId(userId);
        invoice.setCardId(cardId);
        invoice.setAmount(new BigDecimal("400.00"));
        invoice.setStatus("CLOSED");

        when(cardInvoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.save(invoice)).thenReturn(invoice);
        when(cardRepository.save(card)).thenReturn(card);

        cardInvoiceService.payInvoice(invoiceId);

        assertEquals("PAID", invoice.getStatus());
        assertNotNull(invoice.getPaidAt());
        // Since 400.00 is paid, the card's spent used amount decreases from 1000.00 to 600.00
        assertEquals(new BigDecimal("600.00"), card.getUsedAmount());
        verify(cardInvoiceRepository).save(invoice);
        verify(cardRepository).save(card);
    }

    @Test
    void shouldThrowExceptionWhenPayingAlreadyPaidInvoice() {
        UUID invoiceId = UUID.randomUUID();
        CardInvoice invoice = new CardInvoice();
        invoice.setId(invoiceId);
        invoice.setUserId(userId);
        invoice.setStatus("PAID");

        when(cardInvoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));

        assertThrows(IllegalArgumentException.class, () -> {
            cardInvoiceService.payInvoice(invoiceId);
        });
    }

    @Test
    void shouldThrowExceptionWhenInvoiceNotFound() {
        UUID invoiceId = UUID.randomUUID();
        when(cardInvoiceRepository.findById(invoiceId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            cardInvoiceService.payInvoice(invoiceId);
        });
    }
}
