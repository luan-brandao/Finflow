CREATE TABLE notifications (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    category VARCHAR(30) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP,
    event_id UUID NOT NULL,

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT uq_notifications_event_id UNIQUE (event_id)
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);

CREATE TABLE user_notification_preferences (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    receive_invoices BOOLEAN NOT NULL DEFAULT TRUE,
    receive_goals BOOLEAN NOT NULL DEFAULT TRUE,
    receive_budgets BOOLEAN NOT NULL DEFAULT TRUE,
    receive_summary BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT pk_user_notification_preferences PRIMARY KEY (id),
    CONSTRAINT uq_user_notification_preferences_user_id UNIQUE (user_id)
);
