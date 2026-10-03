package com.finflow.financeservice.service;

import com.finflow.financeservice.dto.CardInvoiceResponseDTO;
import com.finflow.financeservice.exception.AccessDeniedException;
import com.finflow.financeservice.exception.ResourceNotFoundException;
import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.model.CardInvoice;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CardInvoiceService {

    private final CardRepository cardRepository;
    private final CardInvoiceRepository cardInvoiceRepository;
    private final TransactionRepository transactionRepository;
    private final EventPublisherService eventPublisherService;

    @Transactional(readOnly = true)
    public List<CardInvoiceResponseDTO> getInvoices(UUID cardId) {
        UUID userId = getAuthenticatedUserId();
        Card card = verifyCardAccess(cardId, userId);

        // 1. Get saved invoices from DB
        List<CardInvoice> savedInvoices = cardInvoiceRepository.findByCardId(cardId);
        Map<String, CardInvoice> savedMap = new HashMap<>();
        for (CardInvoice ci : savedInvoices) {
            savedMap.put(ci.getYear() + "-" + ci.getMonth(), ci);
        }

        // 2. Get distinct year/month combinations with card transactions
        List<Object[]> distinctMonths = transactionRepository.findDistinctYearsAndMonthsByCardId(cardId);
        Set<String> allPeriods = new HashSet<>();
        for (Object[] row : distinctMonths) {
            if (row[0] != null && row[1] != null) {
                // Handle different numeric types returned by Hibernate (Integer, Double, etc.)
                int y = ((Number) row[0]).intValue();
                int m = ((Number) row[1]).intValue();
                allPeriods.add(y + "-" + m);
            }
        }

        // 3. Ensure current month/year is included
        LocalDate today = LocalDate.now();
        allPeriods.add(today.getYear() + "-" + today.getMonthValue());

        // 4. Construct final list of invoices (saved ones + dynamic open ones)
        List<CardInvoiceResponseDTO> list = new ArrayList<>();
        for (String period : allPeriods) {
            String[] parts = period.split("-");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);

            if (savedMap.containsKey(period)) {
                CardInvoice saved = savedMap.get(period);
                list.add(mapToDTO(saved));
            } else {
                BigDecimal amount = transactionRepository.sumExpenseByCardIdAndYearAndMonth(cardId, year, month);
                LocalDate dueDate = calculateDueDate(year, month, card.getDueDay());

                list.add(new CardInvoiceResponseDTO(
                        null,
                        cardId,
                        userId,
                        year,
                        month,
                        amount,
                        "OPEN",
                        dueDate,
                        null,
                        null
                ));
            }
        }

        // 5. Sort desc by year, month
        list.sort((a, b) -> {
            if (a.year() != b.year()) {
                return Integer.compare(b.year(), a.year());
            }
            return Integer.compare(b.month(), a.month());
        });

        return list;
    }

    @Transactional
    public CardInvoiceResponseDTO closeInvoice(UUID cardId, int year, int month) {
        UUID userId = getAuthenticatedUserId();
        Card card = verifyCardAccess(cardId, userId);

        Optional<CardInvoice> existing = cardInvoiceRepository.findByCardIdAndYearAndMonth(cardId, year, month);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A fatura deste período (" + month + "/" + year + ") já está fechada ou paga.");
        }

        BigDecimal amount = transactionRepository.sumExpenseByCardIdAndYearAndMonth(cardId, year, month);
        BigDecimal prepaid = card.getPrepaidAmount() != null ? card.getPrepaidAmount() : BigDecimal.ZERO;
        BigDecimal finalAmount = amount.subtract(prepaid);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }
        
        CardInvoice invoice = new CardInvoice();
        invoice.setCardId(cardId);
        invoice.setUserId(userId);
        invoice.setYear(year);
        invoice.setMonth(month);
        invoice.setAmount(finalAmount);
        invoice.setStatus("CLOSED");
        invoice.setClosedAt(LocalDateTime.now());
        invoice.setDueDate(calculateDueDate(year, month, card.getDueDay()));

        CardInvoice saved = cardInvoiceRepository.save(invoice);

        card.setPrepaidAmount(BigDecimal.ZERO);
        cardRepository.save(card);

        // Publish event
        Map<String, Object> payload = new HashMap<>();
        payload.put("cardId", cardId);
        payload.put("cardName", card.getName());
        payload.put("year", year);
        payload.put("month", month);
        payload.put("amount", finalAmount);
        payload.put("dueDate", invoice.getDueDate().toString());
        eventPublisherService.publishEvent("finance.invoice.closed", "INVOICE_CLOSED", userId, payload);

        return mapToDTO(saved);
    }

    @Transactional
    public CardInvoiceResponseDTO payInvoice(UUID cardId, UUID invoiceId) {
        UUID userId = getAuthenticatedUserId();
        verifyCardAccess(cardId, userId);

        CardInvoice invoice = cardInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura não encontrada."));

        if (!invoice.getCardId().equals(cardId)) {
            throw new AccessDeniedException("Esta fatura não pertence ao cartão especificado.");
        }

        if ("PAID".equals(invoice.getStatus())) {
            throw new IllegalArgumentException("Esta fatura já está paga.");
        }

        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());

        CardInvoice saved = cardInvoiceRepository.save(invoice);
        return mapToDTO(saved);
    }

    private Card verifyCardAccess(UUID cardId, UUID userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));
        if (!card.getUserId().equals(userId)) {
            throw new AccessDeniedException("Você não tem acesso a este cartão de crédito.");
        }
        return card;
    }

    private LocalDate calculateDueDate(int year, int month, int dueDay) {
        // Go to next month safely (handles wrap-around at end of year)
        LocalDate nextMonth = LocalDate.of(year, month, 1).plusMonths(1);
        int maxDay = nextMonth.lengthOfMonth();
        int day = Math.min(dueDay, maxDay);
        return LocalDate.of(nextMonth.getYear(), nextMonth.getMonthValue(), day);
    }

    private CardInvoiceResponseDTO mapToDTO(CardInvoice ci) {
        return new CardInvoiceResponseDTO(
                ci.getId(),
                ci.getCardId(),
                ci.getUserId(),
                ci.getYear(),
                ci.getMonth(),
                ci.getAmount(),
                ci.getStatus(),
                ci.getDueDate(),
                ci.getClosedAt(),
                ci.getPaidAt()
        );
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
