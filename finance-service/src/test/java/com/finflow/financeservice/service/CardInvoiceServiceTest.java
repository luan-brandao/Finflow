package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CardInvoiceResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.model.CardInvoice;
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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardInvoiceServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private CardInvoiceRepository cardInvoiceRepository;

    @Mock
    private TransactionRepository transactionRepository;

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
    void shouldGetInvoicesSuccessfully() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);
        card.setDueDay(10);

        List<CardInvoice> savedInvoices = new ArrayList<>();
        CardInvoice ci = new CardInvoice();
        ci.setId(UUID.randomUUID());
        ci.setCardId(cardId);
        ci.setUserId(userId);
        ci.setYear(LocalDate.now().getYear());
        ci.setMonth(LocalDate.now().getMonthValue());
        ci.setAmount(new BigDecimal("150.00"));
        ci.setStatus("CLOSED");
        ci.setDueDate(LocalDate.now().plusMonths(1));
        savedInvoices.add(ci);

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.findByCardId(cardId)).thenReturn(savedInvoices);
        when(transactionRepository.findDistinctYearsAndMonthsByCardId(cardId)).thenReturn(new ArrayList<>());

        List<CardInvoiceResponseDTO> invoices = cardInvoiceService.getInvoices(cardId);

        assertNotNull(invoices);
        assertFalse(invoices.isEmpty());
        assertEquals(LocalDate.now().getYear(), invoices.get(0).year());
    }

    @Test
    void shouldCloseInvoiceSuccessfully() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);
        card.setName("Visa Gold");
        card.setDueDay(15);
        card.setPrepaidAmount(new BigDecimal("50.00"));

        int year = 2026;
        int month = 10;

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.findByCardIdAndYearAndMonth(cardId, year, month)).thenReturn(Optional.empty());
        when(transactionRepository.sumExpenseByCardIdAndYearAndMonth(cardId, year, month)).thenReturn(new BigDecimal("250.00"));

        CardInvoice savedInvoice = new CardInvoice();
        savedInvoice.setId(UUID.randomUUID());
        savedInvoice.setCardId(cardId);
        savedInvoice.setUserId(userId);
        savedInvoice.setYear(year);
        savedInvoice.setMonth(month);
        savedInvoice.setAmount(new BigDecimal("200.00")); // 250 - 50 prepaid
        savedInvoice.setStatus("CLOSED");
        savedInvoice.setDueDate(LocalDate.of(2026, 11, 15));

        when(cardInvoiceRepository.save(any(CardInvoice.class))).thenReturn(savedInvoice);

        CardInvoiceResponseDTO response = cardInvoiceService.closeInvoice(cardId, year, month);

        assertNotNull(response);
        assertEquals(new BigDecimal("200.00"), response.amount());
        assertEquals("CLOSED", response.status());
        assertEquals(BigDecimal.ZERO, card.getPrepaidAmount()); // verified reset
        verify(cardRepository).save(card);
        verify(eventPublisherService).publishEvent(eq("finance.invoice.closed"), eq("INVOICE_CLOSED"), eq(userId), anyMap());
    }

    @Test
    void shouldThrowExceptionWhenClosingAlreadyClosedInvoice() {
        UUID cardId = UUID.randomUUID();
        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);

        int year = 2026;
        int month = 10;

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.findByCardIdAndYearAndMonth(cardId, year, month)).thenReturn(Optional.of(new CardInvoice()));

        assertThrows(IllegalArgumentException.class, () -> cardInvoiceService.closeInvoice(cardId, year, month));
    }

    @Test
    void shouldPayInvoiceSuccessfully() {
        UUID cardId = UUID.randomUUID();
        UUID invoiceId = UUID.randomUUID();

        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);

        CardInvoice invoice = new CardInvoice();
        invoice.setId(invoiceId);
        invoice.setCardId(cardId);
        invoice.setUserId(userId);
        invoice.setAmount(new BigDecimal("200.00"));
        invoice.setStatus("CLOSED");

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(cardInvoiceRepository.save(invoice)).thenReturn(invoice);

        CardInvoiceResponseDTO response = cardInvoiceService.payInvoice(cardId, invoiceId);

        assertNotNull(response);
        assertEquals("PAID", response.status());
        assertNotNull(response.paidAt());
        verify(cardInvoiceRepository).save(invoice);
    }

    @Test
    void shouldThrowExceptionWhenPayingInvoiceOfAnotherCard() {
        UUID cardId = UUID.randomUUID();
        UUID anotherCardId = UUID.randomUUID();
        UUID invoiceId = UUID.randomUUID();

        Card card = new Card();
        card.setId(cardId);
        card.setUserId(userId);

        CardInvoice invoice = new CardInvoice();
        invoice.setId(invoiceId);
        invoice.setCardId(anotherCardId); // belongs to another card
        invoice.setUserId(userId);

        when(cardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(cardInvoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));

        assertThrows(AccessDeniedException.class, () -> cardInvoiceService.payInvoice(cardId, invoiceId));
    }
}
