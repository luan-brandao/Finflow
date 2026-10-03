package com.finflow.notificationservice.mapper;

import com.finflow.notificationservice.dto.NotificationResponseDTO;
import com.finflow.notificationservice.dto.UserNotificationPreferenceDTO;
import com.finflow.notificationservice.model.Notification;
import com.finflow.notificationservice.model.UserNotificationPreference;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class NotificationMapper {

    public NotificationResponseDTO toResponseDTO(Notification n) {
        if (n == null) return null;
        return new NotificationResponseDTO(
                n.getId(),
                n.getUserId(),
                n.getCategory(),
                n.getPriority(),
                n.getTitle(),
                n.getContent(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReadAt()
        );
    }

    public UserNotificationPreferenceDTO toPreferenceDTO(UserNotificationPreference p, UUID userId) {
        if (p == null) {
            return new UserNotificationPreferenceDTO(userId, true, true, true, true);
        }
        return new UserNotificationPreferenceDTO(
                p.getUserId(),
                p.isReceiveInvoices(),
                p.isReceiveGoals(),
                p.isReceiveBudgets(),
                p.isReceiveSummary()
        );
    }
}
