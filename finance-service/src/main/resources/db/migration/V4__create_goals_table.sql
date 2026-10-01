CREATE TABLE goals (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT pk_goals
        PRIMARY KEY (id)
);

ALTER TABLE transactions ADD COLUMN goal_id UUID;
