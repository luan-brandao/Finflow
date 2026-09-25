CREATE TABLE categories (
    id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    user_id UUID,
    is_default BOOLEAN NOT NULL,

    CONSTRAINT pk_categories
        PRIMARY KEY (id),

    CONSTRAINT chk_categories_default_user
        CHECK (
            (is_default = TRUE AND user_id IS NULL)
            OR
            (is_default = FALSE AND user_id IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uk_categories_user_name
    ON categories (user_id, name)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX uk_categories_default_name
    ON categories (name)
    WHERE is_default = TRUE;