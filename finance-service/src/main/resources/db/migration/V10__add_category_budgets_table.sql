CREATE TABLE category_budgets (
    id UUID NOT NULL,
    category_id UUID NOT NULL,
    user_id UUID NOT NULL,
    limit_amount NUMERIC(15, 2) NOT NULL,
    notified_80 BOOLEAN NOT NULL DEFAULT FALSE,
    notified_100 BOOLEAN NOT NULL DEFAULT FALSE,
    notified_over BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_category_budgets PRIMARY KEY (id),
    CONSTRAINT fk_category_budgets_category_id FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    CONSTRAINT uq_category_budgets_category_id UNIQUE (category_id)
);

CREATE INDEX idx_category_budgets_user_id ON category_budgets (user_id);
