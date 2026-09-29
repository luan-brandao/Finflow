CREATE TABLE monthly_incomes (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT pk_monthly_incomes
        PRIMARY KEY (id),

    CONSTRAINT uq_monthly_incomes_user_year_month
        UNIQUE (user_id, year, month)
);

CREATE TABLE cards (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    credit_limit NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT pk_cards
        PRIMARY KEY (id)
);

ALTER TABLE transactions
    ADD COLUMN card_id UUID;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_card_id
        FOREIGN KEY (card_id)
        REFERENCES cards(id)
        ON DELETE SET NULL;
