# Clockin

Sistema **self-hosted** de registro de ponto eletrônico, pronto para empresas pequenas e médias rodarem em poucos minutos — localmente, em servidor próprio ou na nuvem.

REST API em **Spring Boot 3 / Java 21** + SPA em **Angular 18**. Tudo containerizado e versionado, sem dependência externa.

## Por que usar

- ☁️ **Self-hosted**: seus dados ficam no seu banco, sem SaaS, sem mensalidade
- 🐳 **Sobe em 1 comando**: `docker compose up -d` e está no ar
- 🔐 **JWT + BCrypt**: senhas com hash forte, autenticação stateless
- 👥 **Multi-usuário com papéis**: admin gerencia, funcionário só bate o próprio ponto
- 📊 **Relatório fechado por dia**: horas trabalhadas, extras, faltas, saldo do mês
- 📄 **PDF pronto pra impressão** do espelho de ponto
- 🌐 **i18n (PT-BR / EN)** out-of-the-box
- 🪶 **Stack mainstream** (Spring Boot + Angular + Postgres): fácil de auditar, customizar e contratar gente que mantém

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Início rápido (Docker)](#início-rápido-docker)
- [Desenvolvimento (sem Docker)](#desenvolvimento-sem-docker)
- [Configuração para produção](#configuração-para-produção)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

---

## Pré-requisitos

| Modo | Precisa |
|---|---|
| **Docker** (recomendado) | Docker Desktop ≥ 24 (Windows/Mac) ou Docker Engine + Compose v2 (Linux) |
| **Manual / Dev** | JDK 21, Maven 3.9+, Node.js 20+, PostgreSQL 16 |

> Windows: instale o [Docker Desktop](https://www.docker.com/products/docker-desktop/) e garanta que o WSL2 está atualizado (`wsl --update`).

---

## Início rápido (Docker)

Clone, entre na pasta e suba:

```bash
git clone https://github.com/Jhonysganzerla/clockin.git
cd clockin
docker compose up -d --build
```

Acesse:

| Serviço | URL | Observação |
|---|---|---|
| Web | http://localhost:4200 | UI principal |
| API | http://localhost:8080/api | REST |
| Postgres | `localhost:5432` | db `clockin`, user `clockin` |

### 🔑 Primeiro acesso

Use as credenciais padrão do administrador:

| Campo | Valor |
|---|---|
| **Usuário** | `admin` |
| **Senha** | `admin123` |

> ⚠️ **Troque a senha imediatamente após o primeiro login** (menu Usuários → editar admin). Estas credenciais são públicas — qualquer instância exposta sem essa troca é vulnerável.

Acompanhe logs:

```bash
docker compose logs -f api
docker compose logs -f web
```

Derrube:

```bash
docker compose down          # mantém o banco
docker compose down -v       # apaga o banco também
```

---

## Desenvolvimento (sem Docker)

Útil pra desenvolver com hot reload no front e debug do back direto na IDE.

### 1. Postgres (container avulso)

```bash
docker run -d --name clockin-db \
  -e POSTGRES_DB=clockin \
  -e POSTGRES_USER=clockin \
  -e POSTGRES_PASSWORD=clockin \
  -p 5432:5432 postgres:16
```

### 2. API

```bash
cd clockin-api
DB_USER=clockin DB_PASSWORD=clockin mvn spring-boot:run
```

API em `http://localhost:8080/api`. O Flyway aplica a migration `V1__schema_inicial.sql` automaticamente.

### 3. Web

```bash
cd clockin-web
npm install
npm start
```

UI em `http://localhost:4200` com proxy para `/api` apontando para o backend local.

---

## Configuração para produção

Toda configuração é via **variáveis de ambiente**. Não precisa recompilar pra trocar banco, segredo de JWT ou origem CORS.

### Backend (`clockin-api`)

| Variável | Default | Descrição |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/clockin` | JDBC URL do Postgres |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | `postgres` | Senha do banco |
| `JWT_SECRET` | *(chave dev)* | **Troque obrigatoriamente.** Base64, ≥ 256 bits |
| `CORS_ORIGINS` | `http://localhost:4200` | Origem permitida (separe por vírgula para múltiplas) |
| `SERVER_PORT` | `8080` | Porta HTTP da API |

Exemplo de `JWT_SECRET` seguro:

```bash
openssl rand -base64 64
```

### Atrás de proxy reverso (Nginx, Traefik, Caddy)

O `clockin-web` já sobe num Nginx interno que serve a SPA e faz proxy de `/api` para o container `api`. Para publicar em domínio próprio, basta apontar seu proxy reverso para a porta `4200` do host (que mapeia para a porta `80` do container web). Lembre-se de:

1. Adicionar seu domínio em `CORS_ORIGINS` na `api`
2. Terminar TLS no proxy (Let's Encrypt via Caddy/Traefik é o caminho mais simples)
3. Trocar `JWT_SECRET` antes do primeiro login real

Exemplo mínimo de `docker-compose.override.yml` para produção:

```yaml
services:
  api:
    environment:
      JWT_SECRET: "${JWT_SECRET}"
      CORS_ORIGINS: "https://ponto.suaempresa.com"
    restart: unless-stopped
  web:
    restart: unless-stopped
  db:
    restart: unless-stopped
    volumes:
      - /var/lib/clockin/pgdata:/var/lib/postgresql/data
```

### Backup do banco

```bash
docker exec clockin-db pg_dump -U clockin clockin > backup-$(date +%F).sql
```

Restore:

```bash
docker exec -i clockin-db psql -U clockin clockin < backup.sql
```

---

## Funcionalidades

- **Autenticação JWT**: token de acesso retornado no login, enviado em `Authorization: Bearer ...`
- **Papéis**: `admin` vê e edita tudo; usuário comum só bate o próprio ponto
- **Cadastros (admin)**:
  - Usuários (login, nome, senha, horas/mês, horas/dia, flag admin)
  - Feriados (data, descrição)
- **Bater ponto**:
  - Botão grande na Home registra ponto com data/hora do servidor para o usuário logado
  - Tela de Pontos permite criar/editar/excluir batidas manualmente
- **Relatório**:
  - Filtra por usuário (admin) ou usuário logado, intervalo de datas
  - Agrupa por dia: pares entrada/saída, total trabalhado, extras, faltas, saldo mensal
  - Identifica sábado / domingo / feriado
  - Exporta PDF
- **i18n**: PT-BR e EN, alternável no header

---

## Arquitetura

```
.
├── clockin-api/          Backend Spring Boot 3
│   ├── src/main/java/io/clockin/
│   │   ├── common/       (BaseEntity, conversões, exception handler)
│   │   ├── security/     (JwtService, filtro, SecurityConfig)
│   │   ├── login/        (LoginController)
│   │   ├── usuario/      (entidade, repo, controller)
│   │   ├── feriado/
│   │   └── ponto/        (entidade, repo, service, controller, PDF)
│   └── src/main/resources/db/migration/V1__schema_inicial.sql
├── clockin-web/          Frontend Angular 18 standalone
│   └── src/app/
│       ├── core/         (auth service, guards, interceptor JWT)
│       ├── layout/       (shell, menu)
│       └── features/     (home, login, users, holidays, entries, report)
├── docker-compose.yml
└── README.md
```

### Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA, Flyway, JJWT, iText 8, BCrypt |
| Banco | PostgreSQL 16 |
| Frontend | Angular 18 (standalone), Angular Material, RxJS, ngx-translate |
| Build | Maven (api), Angular CLI + esbuild (web) |
| Runtime | Docker + Docker Compose v2 |

### Endpoints (resumo)

| Método | Path | Auth |
|---|---|---|
| POST | `/api/login/logar` | público |
| GET | `/api/cadusuario/list` | usuário |
| POST | `/api/cadusuario/save` | admin |
| GET | `/api/cadusuario/delete/{id}` | admin |
| GET | `/api/cadferiado/list` | usuário |
| POST | `/api/cadferiado/save` | admin |
| GET | `/api/cadferiado/delete/{id}` | admin |
| POST | `/api/cadponto/save` | usuário |
| GET | `/api/cadponto/listconsulta` | usuário |
| POST | `/api/cadponto/list` | usuário |
| POST | `/api/cadponto/imprimir` | usuário |
| GET | `/api/cadponto/delete/{id}` | usuário |

Detalhes em [`clockin-api/README.md`](clockin-api/README.md).

---

## Troubleshooting

**`502 Bad Gateway` ao acessar a web**
→ A API ainda está subindo ou caiu. Veja `docker compose logs api`. Aguarde alguns segundos no primeiro start (Flyway aplica migration).

**`docker compose up` falha no build do web com `npm ETARGET`**
→ Apague `node_modules` local (se existir) e rebuilde: `docker compose build --no-cache web`.

**Não consigo logar (401)**
→ Confirme que o banco foi recriado depois de qualquer mudança no hash do admin. Force com `docker compose down -v && docker compose up -d --build`.

**Porta 5432 / 8080 / 4200 já em uso**
→ Mude o lado externo do mapeamento no `docker-compose.yml` (ex.: `"15432:5432"`).

**Quero zerar todos os dados**
```bash
docker compose down -v
docker compose up -d
```

---

## Licença

MIT — use, modifique e implante à vontade, inclusive comercialmente.
