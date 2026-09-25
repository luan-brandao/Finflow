CREATE TABLE transactions (
    id UUID NOT NULL,
    user_id UUID NOT NULL,
    description VARCHAR(150) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category_id UUID NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,

    CONSTRAINT pk_transactions
        PRIMARY KEY (id),

    CONSTRAINT chk_transactions_type
        CHECK (type IN ('INCOME', 'EXPENSE'))
);