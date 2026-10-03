package com.finflow.notificationservice.scheduler;

import com.finflow.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@EnableScheduling
@Slf4j
@RequiredArgsConstructor
public class NotificationRetentionScheduler {

    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 2 * * *") // Runs daily at 2:00 AM
    @Transactional
    public void cleanExpiredNotifications() {
        log.info("Iniciando rotina de limpeza automática de notificações expiradas...");

        try {
            LocalDateTime readThreshold = LocalDateTime.now().minusDays(5);
            LocalDateTime unreadThreshold = LocalDateTime.now().minusDays(20);

            // Delete read notifications older than 5 days
            notificationRepository.deleteByIsReadTrueAndCreatedAtBefore(readThreshold);
            log.info("Notificações lidas com mais de 5 dias limpas com sucesso.");

            // Delete unread notifications older than 20 days
            notificationRepository.deleteByIsReadFalseAndCreatedAtBefore(unreadThreshold);
            log.info("Notificações não lidas com mais de 20 dias limpas com sucesso.");

        } catch (Exception e) {
            log.error("Erro ao executar rotina de limpeza de notificações: " + e.getMessage(), e);
        }
    }
}
