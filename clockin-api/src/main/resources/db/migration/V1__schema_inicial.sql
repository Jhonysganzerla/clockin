-- ============================================================
-- Schema inicial - migração do banco PostgreSQL legado
-- Tabelas: cadusuario, cadponto, cadferiado
-- ============================================================

CREATE TABLE cadusuario (
    id        BIGSERIAL    PRIMARY KEY,
    login     VARCHAR(30)  NOT NULL,
    nome      VARCHAR(50),
    senha     VARCHAR(100) NOT NULL,
    horames   INTEGER      NOT NULL,
    horadia   INTEGER      NOT NULL,
    admin     VARCHAR(1)   NOT NULL DEFAULT 'N',
    CONSTRAINT uk_cadusuario_login UNIQUE (login),
    CONSTRAINT ck_cadusuario_admin CHECK (admin IN ('S','N'))
);

CREATE TABLE cadferiado (
    id         BIGSERIAL   PRIMARY KEY,
    dataf      DATE        NOT NULL,
    descricao  VARCHAR(70) NOT NULL
);

CREATE INDEX idx_cadferiado_dataf ON cadferiado (dataf);

CREATE TABLE cadponto (
    id       BIGSERIAL PRIMARY KEY,
    data     DATE      NOT NULL,
    hora     TIME      NOT NULL,
    usuario  BIGINT    NOT NULL,
    CONSTRAINT cadponto_cadusuario FOREIGN KEY (usuario) REFERENCES cadusuario (id)
);

CREATE INDEX idx_cadponto_usuario_data ON cadponto (usuario, data);

-- ============================================================
-- Usuário admin inicial:
--   login: admin
--   senha: admin123  (BCrypt hash abaixo)
-- TROQUE A SENHA APÓS O PRIMEIRO LOGIN.
-- ============================================================
INSERT INTO cadusuario (login, nome, senha, horames, horadia, admin)
VALUES ('admin', 'Administrador',
        '$2b$10$92ifCkyNlb9nZbwnD3BBeurTGDAxdQTtKmDrIt9U8z7aYuCP/kaOC',
        220, 800, 'S');
