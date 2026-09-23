CREATE TABLE users (
                       id UUID NOT NULL,
                       created TIMESTAMP(6) NOT NULL,
                       email VARCHAR(255),
                       name VARCHAR(20),
                       password VARCHAR(255),
                       role VARCHAR(255) NOT NULL,
                       updated TIMESTAMP(6) NOT NULL,

                       CONSTRAINT pk_users PRIMARY KEY (id),
                       CONSTRAINT uk_users_email UNIQUE (email),
                       CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'USER'))
);