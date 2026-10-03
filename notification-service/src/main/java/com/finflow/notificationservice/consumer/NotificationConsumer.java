package com.finflow.notificationservice.consumer;

import com.finflow.notificationservice.dto.FinanceEvent;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "finflow.notifications.queue")
    public void consumeFinanceEvent(FinanceEvent event) {
        log.info("Recebido evento financeiro: ID={}, Tipo={}, Usuário={}", 
                event.eventId(), event.eventType(), event.userId());

        try {
            String category = determineCategory(event.eventType());
            
            // Check if the user wants notifications of this category
            if (!notificationService.isCategoryEnabled(event.userId(), category)) {
                log.info("Notificação ignorada devido às preferências do usuário: Categoria={}, Usuário={}", 
                        category, event.userId());
                return;
            }

            String priority = determinePriority(event.eventType());
            String title = determineTitle(event.eventType(), event.payload());
            String content = determineContent(event.eventType(), event.payload());

            Notification notification = Notification.builder()
                    .userId(event.userId())
                    .category(category)
                    .priority(priority)
                    .title(title)
                    .content(content)
                    .isRead(false)
                    .createdAt(event.occurredAt() != null ? event.occurredAt() : LocalDateTime.now())
                    .eventId(event.eventId())
                    .build();

            notificationService.saveNotification(notification);
            log.info("Notificação processada e persistida com sucesso para o evento: {}", event.eventId());

        } catch (Exception e) {
            log.error("Erro inesperado ao consumir o evento " + event.eventId() + ": " + e.getMessage(), e);
        }
    }

    private String determineCategory(String eventType) {
        if (eventType.startsWith("INVOICE_")) {
            return "FATURAS";
        } else if (eventType.startsWith("GOAL_")) {
            return "METAS";
        } else if (eventType.startsWith("BUDGET_")) {
            return "ORCAMENTOS";
        } else if (eventType.startsWith("MONTHLY_") || eventType.startsWith("SUMMARY_")) {
            return "RESUMO";
        }
        return "OUTROS";
    }

    private String determinePriority(String eventType) {
        return switch (eventType) {
            case "GOAL_REACHED", "GOAL_REACHED_EARLY" -> "SUCCESS";
            case "INVOICE_CLOSED", "MONTHLY_SUMMARY_AVAILABLE" -> "INFO";
            case "INVOICE_REMINDER_7_DAYS", "INVOICE_REMINDER_DUE_DAY", 
                 "GOAL_NO_ACTIVITY", "GOAL_DEADLINE_7_DAYS", "GOAL_DEADLINE_PASSED",
                 "BUDGET_PERCENT_80", "BUDGET_PERCENT_100" -> "WARNING";
            case "INVOICE_OVERDUE", "BUDGET_EXCEEDED" -> "URGENT";
            default -> "INFO";
        };
    }

    private String determineTitle(String eventType, Map<String, Object> payload) {
        return switch (eventType) {
            case "INVOICE_CLOSED" -> "Fatura Fechada";
            case "INVOICE_REMINDER_7_DAYS" -> "Fatura Próxima do Vencimento";
            case "INVOICE_REMINDER_DUE_DAY" -> "Fatura Vence Hoje";
            case "INVOICE_OVERDUE" -> "Fatura Atrasada";
            case "GOAL_REACHED" -> "Meta Atingida! 🎉";
            case "GOAL_REACHED_EARLY" -> "Meta Atingida Antes do Prazo! 🚀";
            case "GOAL_NO_ACTIVITY" -> "Meta Sem Aportes";
            case "GOAL_DEADLINE_7_DAYS" -> "Prazo de Meta Próximo";
            case "GOAL_DEADLINE_PASSED" -> "Prazo de Meta Encerrado";
            case "BUDGET_PERCENT_80" -> "Alerta de Orçamento (80%)";
            case "BUDGET_PERCENT_100" -> "Limite de Orçamento Atingido";
            case "BUDGET_EXCEEDED" -> "Orçamento Ultrapassado ⚠️";
            case "MONTHLY_SUMMARY_AVAILABLE" -> "Resumo Financeiro Mensal";
            default -> "Notificação Finflow";
        };
    }

    private String determineContent(String eventType, Map<String, Object> payload) {
        String cardName = payload.get("cardName") != null ? payload.get("cardName").toString() : "Cartão";
        String amount = payload.get("amount") != null ? payload.get("amount").toString() : "0.00";
        String dueDate = payload.get("dueDate") != null ? payload.get("dueDate").toString() : "";
        String goalTitle = payload.get("goalTitle") != null ? payload.get("goalTitle").toString() : "Meta";
        String categoryName = payload.get("categoryName") != null ? payload.get("categoryName").toString() : "Categoria";
        String month = payload.get("month") != null ? payload.get("month").toString() : "";
        String year = payload.get("year") != null ? payload.get("year").toString() : "";

        return switch (eventType) {
            case "INVOICE_CLOSED" -> String.format("Sua fatura do cartão %s foi fechada em R$ %s. Vencimento: %s.", cardName, amount, dueDate);
            case "INVOICE_REMINDER_7_DAYS" -> String.format("Sua fatura do cartão %s de R$ %s vence em 7 dias (%s).", cardName, amount, dueDate);
            case "INVOICE_REMINDER_DUE_DAY" -> String.format("Sua fatura do cartão %s de R$ %s vence hoje!", cardName, amount);
            case "INVOICE_OVERDUE" -> String.format("Sua fatura do cartão %s está fechada e precisa ser paga.", cardName);
            case "GOAL_REACHED" -> String.format("Parabéns! Sua meta \"%s\" foi atingida!", goalTitle);
            case "GOAL_REACHED_EARLY" -> String.format("🎉 Meta atingida antes do prazo! Parabéns pelo planejamento na meta \"%s\"!", goalTitle);
            case "GOAL_NO_ACTIVITY" -> String.format("Sua meta \"%s\" não recebeu nenhum aporte este mês. Que tal economizar um pouco hoje?", goalTitle);
            case "GOAL_DEADLINE_7_DAYS" -> String.format("Atenção: faltam 7 dias para o prazo da sua meta \"%s\".", goalTitle);
            case "GOAL_DEADLINE_PASSED" -> String.format("O prazo terminou para a sua meta \"%s\" sem atingir o objetivo planejado.", goalTitle);
            case "BUDGET_PERCENT_80" -> String.format("Você já utilizou 80% do seu orçamento de %s.", categoryName);
            case "BUDGET_PERCENT_100" -> String.format("Você atingiu o limite definido para %s.", categoryName);
            case "BUDGET_EXCEEDED" -> String.format("Você ultrapassou o limite definido para %s.", categoryName);
            case "MONTHLY_SUMMARY_AVAILABLE" -> String.format("Seu resumo financeiro de %s de %s está disponível.", month, year);
            default -> "Você possui uma nova atualização financeira no Finflow.";
        };
    }
}
