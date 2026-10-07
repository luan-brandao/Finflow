# Finflow — Finance Service

O **Finance Service** é o microsserviço central do Finflow, responsável pelo processamento de todas as regras de negócios financeiras do sistema. Ele gerencia as receitas, despesas, cartões de crédito, faturas, limites, orçamentos categorizados e metas de poupança, além de consolidar o dashboard financeiro em tempo real e disparar eventos assíncronos de controle.

---

## Responsabilidades

Este serviço encapsula e executa as seguintes responsabilidades:
1. **Controle de Transações**: Registro, edição e exclusão de receitas e despesas com categorização automática.
2. **Ciclo de Cartões de Crédito**: Gestão de limites de crédito, controle de limites utilizados, pagamentos antecipados e fechamento de faturas.
3. **Gestão de Metas de Poupança (Goals)**: Criação de metas financeiras com acompanhamento do progresso de acumulação via aportes vinculados.
4. **Planejamento Orçamentário**: Monitoramento de limites de orçamento por categoria (Budgets) e disparos de alertas de limite.
5. **Dashboard Consolidado**: Cálculo e agregação de dados financeiros dinâmicos (como renda mensal, valor disponível e taxas de comprometimento de renda).
6. **Agendamento de Varreduras (Schedulers)**: Verificação automática diária de faturas vencendo/atrasadas e metas próximas de prazos.

---

## Principais Funcionalidades

### Categorias
* **Categorias Padrão e Customizadas**: Suporta categorias em nível global (disponibilizadas pelo sistema para todos, com `userId = null`) e categorias criadas pelo próprio usuário para seu controle particular.
* **Unicidade e Validações**: Validações de duplicidade para impedir que um usuário crie categorias com nomes idênticos sob seu escopo.

### Transações
* **Tipos de Lançamento**: Registro de transações divididas estritamente entre `INCOME` (Receitas) e `EXPENSE` (Despesas).
* **Vínculo Multirrecursos**: Uma transação pode ser vinculada diretamente a uma Categoria (obrigatório), a um Cartão de Crédito (despesa no crédito) ou a uma Meta de Poupança (aporte de poupança).

### Metas (Goals)
* **Progressão Automatizada**: Sempre que um aporte (`INCOME` vinculado a uma meta) é criado, o valor atual acumulado da meta (`currentAmount`) é atualizado.
* **Segurança de Exclusão**: Quando uma transação de aporte vinculada a uma meta é excluída, o valor correspondente é subtraído de forma automática de `currentAmount`.
* **Disparo de Conquistas**: Se a meta atinge ou ultrapassa o valor objetivo (`targetAmount`), o sistema dispara de forma imediata um evento de conquista (`GOAL_REACHED` ou `GOAL_REACHED_EARLY`).

### Cartões de Crédito e Faturas
* **Limite Dinâmico**: Ao lançar despesas de cartão, o limite disponível é reduzido. O pagamento da fatura ou adiantamento de limites recompõe o limite do cartão.
* **Gerenciamento de Faturas**: Sistema automatizado de geração, fechamento e controle de faturas, com estados divididos entre `OPEN` (Aberta), `CLOSED` (Fechada) e `PAID` (Paga).

### Dashboard Financeiro (Cálculos de Consolidação)
Os valores consolidados exibidos na interface principal do usuário são calculados de forma dinâmica:
* **Consolidação Básica**: Soma total de `INCOME` (Receitas), soma total de `EXPENSE` (Despesas) e diferença líquida (`Balance`) dentro do período selecionado.
* **Renda Mensal de Referência**: Registro da receita esperada cadastrada para o mês (`MonthlyIncome`), servindo como base de projeção.
* **Valor Disponível (`availableValue`)**: Calculado como:
  $$\text{Valor Disponível} = \text{Renda Mensal} + \text{Total de Receitas no Período} - \text{Total de Despesas no Período}$$
* **Comprometimento de Renda (`committedPercentage`)**: Razão percentual de despesas contra a renda mensal esperada.
* **⚠️ Regra Antiduplicidade de Metas (Isolamento de Poupança)**:
  Para evitar que o dinheiro guardado para uma meta infle artificialmente o saldo livre e o dashboard geral de despesas e receitas diárias:
  * *Quando o usuário visualiza o Dashboard consolidado principal (filtro de meta ausente)*, **todas as transações vinculadas a metas (`goalId != null`) são filtradas e removidas dos cálculos gerais**. Isso garante que o capital guardado para conquistas futuras seja protegido visualmente e contabilizado apenas no escopo de suas respectivas metas.

---

## Regras de Negócio Implementadas

* **Garantia de Propriedade (Ownership)**: Toda transação, categoria customizada, cartão, fatura ou meta pertence estritamente a um `userId`. O sistema bloqueia modificações e visualizações por outros usuários através de verificações em nível de serviço.
* **Verificação de Limite de Saque de Metas**: O sistema impede que o usuário faça resgates ou exclua aportes de uma meta se o valor acumulado dela for menor do que o montante da retirada.
* **Regras de Envio de Faturas (Notificações por Ciclo)**: O sistema de agendamento monitora faturas fechadas diariamente e dispara notificações importantes via mensageria:
  * Faltando exatamente **7 dias** para o vencimento -> Alerta `INVOICE_REMINDER_7_DAYS`.
  * No **dia exato** do vencimento -> Alerta `INVOICE_REMINDER_DUE_DAY`.
  * Vencimento ultrapassado sem pagamento -> Marca a fatura como atrasada e dispara alerta `INVOICE_OVERDUE`.
* **Regras de Prazos de Metas**: Notificações automáticas disparadas em caso de metas não cumpridas faltando 7 dias para o prazo (`GOAL_DEADLINE_7_DAYS`) ou quando o prazo termina sem atingir o objetivo (`GOAL_DEADLINE_PASSED`).

---

## Segurança e Isolamento de Dados

A segurança do **Finance Service** é do tipo stateless integrada ao Spring Security:
1. **Identificação Segura via JWT**: O microsserviço lê o cabeçalho `Authorization: Bearer <JWT_TOKEN>`, decodifica o token usando a chave secreta simétrica base64 compartilhada e extrai o subject (UUID do Usuário) injetando-o no `SecurityContextHolder`.
2. **Validação de Propriedade em Endpoints Privados**:
   Cada operação sobre recursos específicos valida se o proprietário real do registro no banco de dados corresponde ao usuário autenticado antes de executar qualquer ação de consulta, edição ou exclusão.
   * *Exemplo prático de fluxo de verificação:*
     ```java
     // Na camada Service:
     Goal goal = goalRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
     if (!goal.getUserId().equals(authenticatedUserId)) {
         throw new AccessDeniedException("Você não tem acesso a esta meta.");
     }
     ```
   Isso mitiga vulnerabilidades de ID de recursos inseguros (IDOR), garantindo que um usuário autenticado não consiga acessar os dados de outros usuários simplesmente enviando um UUID aleatório de cartão, meta ou transação nas requisições `GET /api/cards/{id}`, `PUT /api/cards/{id}` ou `DELETE /api/cards/{id}`.

---

## Modelo de Dados e Entidades JPA

As tabelas de persistência relacional do PostgreSQL mapeadas por entidades no microsserviço são as seguintes:

```text
  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
  │   Category   │◄─────────┤ Transaction  ├─────────►│     Card     │
  └──────────────┘          └──────┬───────┘          └──────┬───────┘
                                   │                         │
                                   ▼                         ▼
                            ┌──────────────┐          ┌──────────────┐
                            │     Goal     │          │ CardInvoice  │
                            └──────────────┘          └──────────────┘
```

1. **Category**: Armazena as categorias de transações. Possui o campo `userId` (nulo para categorias globais do sistema) e `name` (tamanho limite de 50 caracteres).
2. **Transaction**: Registra cada movimentação financeira. Possui `description`, `amount` (BigDecimal com precisão de duas casas decimais), `type` (INCOME/EXPENSE), `date` (LocalDate), e relacionamentos opcionais com `cardId` e `goalId`.
3. **Goal**: Representa as metas de poupança. Possui `title`, `targetAmount`, `currentAmount`, `targetDate`, `status` (ACTIVE/COMPLETED) e flags de controle de alertas disparados (`reachedNotified`, `deadlineNotified`).
4. **Card**: Cadastro de cartões de crédito. Armazena o limite de crédito (`creditLimit`), dia de vencimento (`dueDay`) e limite utilizado (`used`).
5. **CardInvoice**: Faturas vinculadas aos cartões. Registra o período (`year`, `month`), valor consolidado da fatura (`amount`), dia limite para pagamento (`dueDate`) e estado atual (`OPEN`, `CLOSED`, `PAID`).
6. **CategoryBudget**: Define limites mensais de gastos por categoria específica.
7. **MonthlyIncome**: Armazena a renda de referência informada pelo usuário para cada mês/ano de orçamento.

---

## Banco de Dados e Migrations (PostgreSQL)

O banco de dados do microsserviço utiliza o **Flyway** para orquestrar as migrations de dados e manter a consistência com o Hibernate JPA em tempo de execução:

### Histórico de Migrations (`db/migration`)
* **`V1__create_categories_table.sql`**: Cria a tabela básica de categorias de gastos.
* **`V2__create_transactions_table.sql`**: Cria a tabela de transações contendo constraints de foreign keys com categorias.
* **`V3__create_monthly_income_and_cards.sql`**: Cria as tabelas de controle de renda mensal e cadastro de cartões de crédito.
* **`V4__create_goals_table.sql`**: Cria a estrutura para persistência de metas de poupança.
* **`V5__create_card_invoices_table.sql`**: Provisiona a tabela de controle de faturas mensais por cartão de crédito.
* **`V6__add_due_day_to_cards.sql`**: Adiciona a coluna de controle do dia de vencimento de faturas à tabela de cartões.
* **`V7__add_prepaid_amount_to_cards.sql`**: Adiciona coluna para controle de pagamentos antecipados que liberam limite.
* **`V8__add_overdue_notified_to_invoices.sql`**: Adiciona flag booleana de controle para evitar disparos duplicados de faturas em atraso.
* **`V9__add_notifications_control_to_goals.sql`**: Adiciona flags de controle para evitar notificações repetitivas de metas atingidas ou expiradas.
* **`V10__add_category_budgets_table.sql`**: Cria a tabela e constraints de controle de planejamento de teto de gastos (`category_budgets`).
* **`V11__add_status_to_goals.sql`**: Adiciona a coluna de estado da meta para controle de metas ativas e concluídas.

---

## Principais Endpoints

### 1. Categorias (`/api/categories`)
* `POST /api/categories`: Cria nova categoria customizada para o usuário autenticado.
* `GET /api/categories`: Retorna todas as categorias disponíveis para o usuário (as categorias globais + suas categorias customizadas).
* `DELETE /api/categories/{id}`: Exclui uma categoria pertencente ao usuário.

### 2. Transações (`/api/transactions`)
* `POST /api/transactions`: Registra nova transação (atualiza limites de cartões ou saldos de metas de forma automática caso vinculada).
* `GET /api/transactions`: Lista transações filtradas do usuário logado por período e parâmetros.
* `DELETE /api/transactions/{id}`: Remove um lançamento e reverte seus efeitos financeiros sobre cartões ou metas.

### 3. Metas de Poupança (`/api/goals`)
* `POST /api/goals`: Registra nova meta.
* `GET /api/goals`: Lista todas as metas ativas do usuário.
* `PUT /api/goals/{id}`: Atualiza parâmetros de uma meta cadastrada.

### 4. Cartões de Crédito (`/api/cards`)
* `POST /api/cards`: Cria novo cartão com limite definido.
* `GET /api/cards`: Lista todos os cartões cadastrados pelo usuário autenticado.

### 5. Faturas de Cartão (`/api/card-invoices`)
* `GET /api/card-invoices`: Consulta faturas abertas/fechadas.
* `POST /api/card-invoices/{id}/pay`: Efetua o pagamento de uma fatura fechada, liberando o limite de crédito consumido do cartão.

### 6. Dashboard (`/api/dashboard`)
* `GET /api/dashboard`: Retorna o relatório consolidado de receitas, despesas, top despesas e dados de cartões para o período de datas especificado via query params (`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`).

---

## Configurações do Microsserviço

| Variável de Ambiente | Propriedade Spring | Utilidade do Parâmetro |
| :--- | :--- | :--- |
| `JWT_SECRET` | `jwt.secret` | Segredo simétrico em formato base64 para validação stateless das requisições REST |
| `server.port` | `server.port` | Porta HTTP padrão onde o microsserviço de finanças responde (porta: `8082`) |
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | Endereço JDBC de conexão com a base PostgreSQL dedicada do serviço |
| `SPRING_DATASOURCE_USERNAME`| `spring.datasource.username`| Usuário cadastrado para autenticação no PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD`| `spring.datasource.password`| Senha cadastrada para autenticação no PostgreSQL |
| `eureka.client.service-url.defaultZone` | `eureka.client...` | Endereço HTTP para comunicação com o Discovery Server Eureka |

*Nota: Em ambientes de desenvolvimento locais ou de avaliação rápida por terceiros, credenciais padrão amigáveis podem estar configuradas. Todas essas chaves locais de demonstração são fictícias e não possuem relação com ambientes produtivos, onde devem ser gerenciadas via ferramentas externas robustas de gerenciamento de secrets.*

---

## Integrações e Comunicação Orientada a Eventos (RabbitMQ)

O **Finance Service** interage de forma dinâmica com o restante do ecossistema do Finflow através de:

1. **API Gateway**: Roteamento externo HTTP unificado para a porta `8082`.
2. **Eureka Server**: Registro automático e anúncio de disponibilidade na rede interna.
3. **RabbitMQ (Mensageria Assíncrona)**:
   O microsserviço de finanças atua como um **Producer** de eventos de mensageria assíncrona de alta performance:
   * **Exchange Configurada**: `finflow.finance.exchange` (do tipo **Topic**).
   * **Routing Key Pattern**: `finance.#` (usado para publicar mensagens na fila de notificações).
   * **Eventos Publicados**:
     * `INVOICE_REMINDER_7_DAYS` / `INVOICE_REMINDER_DUE_DAY` (na routing key `finance.invoice.reminder`): Lançados por schedulers automáticos para alertar faturas próximas de vencer.
     * `INVOICE_OVERDUE` (na routing key `finance.invoice.overdue`): Lançado no atraso do vencimento.
     * `GOAL_REACHED` / `GOAL_REACHED_EARLY` (na routing key `finance.goal.reached`): Lançados ao atingir a meta.
     * `BUDGET_EXCEEDED` / `BUDGET_PERCENT_80` (na routing key `finance.budget.threshold`): Lançados se o limite teto de gastos de categorias for ultrapassado ou atingir 80%.

---

## Schedulers e Tarefas Automáticas (`FinanceScheduler`)

O serviço possui uma rotina automática diária ativada pela anotação `@Scheduled`:
* **Frequência de Execução**: Diariamente, às **1:00 AM** (`cron = "0 0 1 * * *"`).
* **Processos Executados**:
  1. Varredura e fechamento de ciclos de faturas de cartões de crédito vencendo.
  2. Envio automático de lembretes e alertas de faturas próximas, no dia exato do vencimento ou atrasadas.
  3. Varredura de prazos de metas ativas para disparo de lembretes de expiração.
  4. Varredura mensal (no dia 25 do mês) de metas ativas com **zero atividade** de novos aportes no mês corrente (`GOAL_NO_ACTIVITY`).

---

## Empacotamento Docker

* **Imagem Base**: JRE baseada em eclipse-temurin JDK 21 (`eclipse-temurin:21-jre`).
* **Processo**: Compilação via Multi-stage Build Maven isolado, copiando o arquivo compactado executável `app.jar` final para um contêiner limpo sem dependências excedentes.
* **Porta exposta**: `8082`.

---

## Suíte de Testes Automatizados

* **Testes Unitários**: Testes robustos para as regras de negócio em services usando Mockito:
  * `CardServiceTest`, `CardInvoiceServiceTest`, `DashboardServiceTest`, `TransactionServiceTest` e `GoalServiceTest`.
* **Testes de Integração com Testcontainers**:
  * **`FinanceRepositoryIntegrationTest.java`**: Validação de consultas em banco Postgres real contendo constraints físicas para cartões, categorias e metas.
  * **`FinanceServiceIntegrationTest.java`**: Testes das regras integradas de criação e atualização de cartões de crédito e metas, cobrindo o ciclo de persistência e segurança de rotas de forma real.
  * **`FinanceControllerIntegrationTest.java`**: Testes de ponta a ponta simulando requisições HTTP via MockMvc autenticadas programaticamente por tokens JWT contra o contêiner Docker temporário do PostgreSQL.
