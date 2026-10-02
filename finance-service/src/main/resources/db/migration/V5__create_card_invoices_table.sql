CREATE TABLE card_invoices (
    id UUID NOT NULL,
    card_id UUID NOT NULL,
    user_id UUID NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    due_date DATE NOT NULL,
    closed_at TIMESTAMP,
    paid_at TIMESTAMP,

    CONSTRAINT pk_card_invoices PRIMARY KEY (id),
    CONSTRAINT fk_card_invoices_card_id FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT uq_card_invoices_card_year_month UNIQUE (card_id, year, month)
);
