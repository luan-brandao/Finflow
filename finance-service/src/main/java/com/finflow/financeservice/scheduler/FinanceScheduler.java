package com.finflow.financeservice.scheduler;

import com.finflow.financeservice.model.Card;
import com.finflow.financeservice.model.CardInvoice;
import com.finflow.financeservice.model.Goal;
import com.finflow.financeservice.model.Transaction;
import com.finflow.financeservice.repository.CardInvoiceRepository;
import com.finflow.financeservice.repository.CardRepository;
import com.finflow.financeservice.repository.GoalRepository;
import com.finflow.financeservice.repository.TransactionRepository;
import com.finflow.financeservice.service.EventPublisherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class FinanceScheduler {

    private final CardInvoiceRepository cardInvoiceRepository;
    private final CardRepository cardRepository;
    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;
    private final EventPublisherService eventPublisherService;

    @Scheduled(cron = "0 0 1 * * *") // Runs daily at 1:00 AM
    @Transactional
    public void runDailyChecks() {
        log.info("Iniciando varredura diária de faturas e metas no Finance Service...");
        checkInvoices();
        checkGoalsDeadlines();
        checkGoalsNoActivity();
    }

    private void checkInvoices() {
        List<CardInvoice> closedInvoices = cardInvoiceRepository.findAll()
                .stream()
                .filter(ci -> "CLOSED".equals(ci.getStatus()))
                .toList();

        LocalDate today = LocalDate.now();

        for (CardInvoice ci : closedInvoices) {
            Card card = cardRepository.findById(ci.getCardId()).orElse(null);
            if (card == null) continue;

            Map<String, Object> payload = new HashMap<>();
            payload.put("cardId", ci.getCardId());
            payload.put("cardName", card.getName());
            payload.put("year", ci.getYear());
            payload.put("month", ci.getMonth());
            payload.put("amount", ci.getAmount());
            payload.put("dueDate", ci.getDueDate().toString());

            // Rule: 7 days before due date
            if (ci.getDueDate().equals(today.plusDays(7))) {
                eventPublisherService.publishEvent(
                        "finance.invoice.reminder", 
                        "INVOICE_REMINDER_7_DAYS", 
                        ci.getUserId(), 
                        payload
                );
            }

            // Rule: On due date
            if (ci.getDueDate().equals(today)) {
                eventPublisherService.publishEvent(
                        "finance.invoice.reminder", 
                        "INVOICE_REMINDER_DUE_DAY", 
                        ci.getUserId(), 
                        payload
                );
            }

            // Rule: Overdue invoice (once only via overdue_notified flag)
            if (ci.getDueDate().isBefore(today) && !ci.isOverdueNotified()) {
                eventPublisherService.publishEvent(
                        "finance.invoice.overdue", 
                        "INVOICE_OVERDUE", 
                        ci.getUserId(), 
                        payload
                );
                ci.setOverdueNotified(true);
                cardInvoiceRepository.save(ci);
            }
        }
    }

    private void checkGoalsDeadlines() {
        List<Goal> activeGoals = goalRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Goal g : activeGoals) {
            BigDecimal current = g.getCurrentAmount() != null ? g.getCurrentAmount() : BigDecimal.ZERO;
            BigDecimal target = g.getTargetAmount() != null ? g.getTargetAmount() : BigDecimal.ZERO;

            if (current.compareTo(target) >= 0) {
                continue; // Goal already achieved, no deadline alerts needed
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("goalId", g.getId());
            payload.put("goalTitle", g.getTitle());
            payload.put("currentAmount", current);
            payload.put("targetAmount", target);
            payload.put("targetDate", g.getTargetDate().toString());

            // Rule: 7 days before target deadline
            if (g.getTargetDate().equals(today.plusDays(7)) && !g.isDeadlineNotified()) {
                eventPublisherService.publishEvent(
                        "finance.goal.deadline.reminder", 
                        "GOAL_DEADLINE_7_DAYS", 
                        g.getUserId(), 
                        payload
                );
                g.setDeadlineNotified(true);
                goalRepository.save(g);
            }

            // Rule: Target date passed without hit (Goal deadline finished)
            if (g.getTargetDate().isBefore(today) && !g.isDeadlineNotified()) {
                eventPublisherService.publishEvent(
                        "finance.goal.deadline.passed", 
                        "GOAL_DEADLINE_PASSED", 
                        g.getUserId(), 
                        payload
                );
                g.setDeadlineNotified(true);
                goalRepository.save(g);
            }
        }
    }

    private void checkGoalsNoActivity() {
        // Runs once a month (e.g. on the 25th) to verify metas with no aportes this month
        if (LocalDate.now().getDayOfMonth() != 25) {
            return;
        }

        List<Goal> activeGoals = goalRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Goal g : activeGoals) {
            List<Transaction> goalTxs = transactionRepository.findByGoalId(g.getId());
            
            long countThisMonth = goalTxs.stream()
                    .filter(tx -> tx.getDate() != null && 
                            tx.getDate().getMonthValue() == today.getMonthValue() && 
                            tx.getDate().getYear() == today.getYear())
                    .count();

            if (countThisMonth == 0) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("goalId", g.getId());
                payload.put("goalTitle", g.getTitle());
                
                eventPublisherService.publishEvent(
                        "finance.goal.no_activity", 
                        "GOAL_NO_ACTIVITY", 
                        g.getUserId(), 
                        payload
                );
            }
        }
    }

    // =========================================================================
    // REGRA EM ABERTO (Placeholder de Resumo Mensal)
    // Conforme a Seção 6 dos Requisitos, a decisão de negócio sobre o momento exato 
    // do disparo do resumo mensal continua em aberto para definição futura.
    // Deixamos o esqueleto operacional preparado para ativação imediata posterior.
    // =========================================================================
    public void generateMonthlySummaryPlaceholder(UUID userId, int year, int month) {
        log.info("Placeholder operacional de Resumo Mensal preparado para usuário {}: período {}/{}", 
                userId, month, year);
        
        // Map<String, Object> payload = new HashMap<>();
        // payload.put("month", "Setembro");
        // payload.put("year", year);
        // eventPublisherService.publishEvent("finance.summary.available", "MONTHLY_SUMMARY_AVAILABLE", userId, payload);
    }
}
