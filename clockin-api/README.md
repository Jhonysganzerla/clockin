# clockin-api — Backend Spring Boot

Versão modernizada do sistema de registro de ponto. Migrada de Java EE 7 + Restlet/Jersey + Hibernate 4 para **Spring Boot 3.3 + Java 21 + PostgreSQL + Flyway + JWT**.

## Stack

- Java 21
- Spring Boot 3.3.x (web, data-jpa, security, validation)
- PostgreSQL + Flyway (migrations versionadas)
- JJWT 0.12 (JWT HS256)
- BCrypt para hash de senhas
- iText 8 (geração de PDF)

## Como rodar

### 1. Banco

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE clockin;
```

O Flyway cuida do schema na primeira inicialização (`V1__schema_inicial.sql`).

### 2. Variáveis de ambiente (opcional)

| Variável         | Default                                  |
|------------------|------------------------------------------|
| `DB_URL`         | `jdbc:postgresql://localhost:5432/clockin` |
| `DB_USER`        | `postgres`                               |
| `DB_PASSWORD`    | `postgres`                               |
| `JWT_SECRET`     | (chave dev — **troque em produção**)     |
| `CORS_ORIGINS`   | `http://localhost:4200`                  |
| `SERVER_PORT`    | `8080`                                   |

### 3. Subir

```bash
./mvnw spring-boot:run
# ou
mvn spring-boot:run
```

API em `http://localhost:8080/api`.

### 4. Login inicial

```
login: admin
senha: admin123
```
**Troque imediatamente após o primeiro login.**

## Endpoints (preserva paths do legado)

| Método | Path                              | Descrição                          | Auth      |
|--------|-----------------------------------|------------------------------------|-----------|
| POST   | `/api/login/logar`                | Autentica, retorna JWT             | público   |
| GET    | `/api/cadusuario/list`            | Lista usuários                     | usuário   |
| GET    | `/api/cadusuario/findOne/{id}`    | Busca usuário                      | usuário   |
| POST   | `/api/cadusuario/save`            | Cria/atualiza usuário              | admin     |
| GET    | `/api/cadusuario/delete/{id}`     | Remove usuário                     | admin     |
| GET    | `/api/cadferiado/list`            | Lista feriados                     | usuário   |
| POST   | `/api/cadferiado/save`            | Cria/atualiza feriado              | admin     |
| GET    | `/api/cadferiado/delete/{id}`     | Remove feriado                     | admin     |
| POST   | `/api/cadponto/list`              | Consulta agrupada com cálculo      | usuário   |
| POST   | `/api/cadponto/imprimir`          | PDF do relatório                   | usuário   |
| POST   | `/api/cadponto/save`              | Registra batida                    | usuário   |
| GET    | `/api/cadponto/delete/{id}`       | Remove batida                      | usuário   |

Após login, envie `Authorization: Bearer <token>` em todas as chamadas.

## Mudanças relevantes em relação ao legado

- **Senhas com BCrypt** (cost factor 10). Nunca armazena texto puro nem hash inseguro.
- **Token caseiro em memória → JWT stateless**. Sem mais lista global de tokens.
- **Bugs de cálculo corrigidos**:
  - `conversao()` antigo usava `hours * 360000` (1/10 do correto). Corrigido para conversão limpa via `LocalTime`/`Duration`.
  - Multiplicação espúria `user * 1000` removida — HHMM é convertido diretamente em milissegundos.
  - No caso "sábado de mensalista com horas < 4h", o falta era `4h + total` (somava em vez de subtrair). Corrigido para `4h - total`.
- **`Date` legado → `LocalDate`/`LocalTime`** (java.time).
- **GenericDao/Filter/OperatorWhere** removidos — substituídos por Spring Data JPA / query methods.
- **CorsRequestFilter manual → `CorsConfigurationSource`** do Spring.
- **`open-in-view: false`** — não há mais lazy loading "mágico" fora da transação.

## Estrutura

```
src/main/java/io/clockin/
├── ClockinApplication.java
├── common/          (BaseEntity, ConvertUtils, BooleanSnConverter, ExceptionHandler)
├── security/        (JwtService, JwtAuthenticationFilter, SecurityConfig)
├── login/           (LoginController, LoginRequest/Response)
├── usuario/         (Entity, Repository, Service, Controller)
├── feriado/         (Entity, Repository, Service, Controller)
└── ponto/           (Entity, Repository, Service, PdfService, Controller, dto/)
```

## Próximos passos sugeridos

- [ ] Tests com `@SpringBootTest` + Testcontainers (PostgreSQL real em teste)
- [ ] Atualizar o frontend Angular 5 → Angular 18+ (rotas `/api/...` e novo header `Authorization`)
- [ ] Validar regras de cálculo com casos do passado
- [ ] Dockerfile + docker-compose (Postgres + app)
- [ ] Refresh token e expiração mais curta no access token
