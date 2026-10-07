# Finflow — Notification Service

O **Notification Service** é o microsserviço assíncrono do Finflow responsável pela gestão, filtragem, preferências e retenção de notificações direcionadas aos usuários. Ele opera de forma reativa, escutando eventos de negócio gerados por outros microsserviços do ecossistema e transformando-os em alertas personalizados e históricos persistidos de mensagens.

---

## Responsabilidade

O microsserviço resolve o problema de comunicação assíncrona orientada a eventos e desempenha as seguintes responsabilidades:
1. **Consumo de Eventos de Negócio**: Escuta as mensagens publicadas no Message Broker (RabbitMQ) de maneira desacoplada.
2. **Filtragem por Preferência**: Avalia em tempo de execução se o usuário optou por receber alertas de determinada categoria antes de persistir a mensagem.
3. **Gerenciamento de Mensagens**: Exposição de endpoints seguros para o usuário ler, contar pendências, excluir e marcar notificações como lidas.
4. **Limpeza e Retenção de Dados (Retention Scheduler)**: Execução automática periódica de rotinas de limpeza para evitar o crescimento excessivo e desnecessário da base de dados de alertas históricos.

---

## Principais Funcionalidades

* **Consumo de Mensagens Multi-Origem**: Consome de forma integrada eventos de metas de poupança, faturas de cartão de crédito e limites de teto de categorias.
* **Geração Automática de Histórico**: Converte payloads de eventos dinâmicos (como valores, nomes de recursos e prazos) em títulos e conteúdos textuais legíveis e localizados em português brasileiro.
* **Marcação de Leitura Única ou em Lote**: Suporte para o usuário marcar um alerta individual como lido (`PUT /api/notifications/{id}/read`) ou todas as suas notificações pendentes de uma só vez (`PUT /api/notifications/read-all`).
* **Preferências Individuais**: Permite a ativação/desativação de categorias específicas de alertas de forma isolada para cada usuário.
* **Remoção Autônoma**: O usuário pode excluir de sua caixa de entrada as notificações que não deseja mais visualizar.

---

## RabbitMQ e Comunicação Assíncrona

A integração assíncrona do Finflow permite que operações pesadas de verificação diária, estouros de limite ou faturas fechadas sejam distribuídas sem onerar o tempo de resposta das requisições HTTP síncronas do usuário.

### Fluxo de Comunicação Assíncrona
```text
┌─────────────────┐             ┌─────────────────────┐             ┌──────────────────────┐
│ FINANCE-SERVICE │             │  RABBITMQ BROKER    │             │ NOTIFICATION-SERVICE │
│                 │             │                     │             │                      │
│ Publica Evento  │ ──────────► │ Exchange:           │ ──────────► │ Fila:                │
│ de Fechamento   │             │ finflow.finance...  │             │ finflow.notific...   │
│ de Fatura       │             │ (Topic)             │             │                      │
└─────────────────┘             └─────────────────────┘             └──────────┬───────────┘
                                                                               │
                                                                               ▼
                                                                    Persiste Notificação 
                                                                    no Banco de Alertas
```

### Configurações de Mensageria
* **Exchange de Entrada**: `finflow.finance.exchange` (tipo **Topic**).
* **Fila Dedicada**: `finflow.notifications.queue` (vinculada à exchange anterior).
* **Consumidor (`NotificationConsumer`)**: Ouve a fila de entrada através da anotação `@RabbitListener(queues = "finflow.notifications.queue")` e processa mensagens mapeadas pela estrutura deserializada `FinanceEvent`.

---

## Eventos Consumidos e Regras de Notificação

Sempre que uma mensagem de evento chega à fila, o `NotificationConsumer` determina dinamicamente sua Categoria, Prioridade, Título e Texto descritivo.

| Evento de Origem (`eventType`) | Categoria de Alerta | Prioridade do Alerta | Título da Notificação | Texto da Mensagem (Payload Dinâmico) |
| :--- | :--- | :--- | :--- | :--- |
| `INVOICE_CLOSED` | `FATURAS` | `INFO` | Fatura Fechada | *"Sua fatura do cartão {cardName} foi fechada em R$ {amount}. Vencimento: {dueDate}."* |
| `INVOICE_REMINDER_7_DAYS` | `FATURAS` | `WARNING` | Fatura Próxima do Vencimento | *"Sua fatura do cartão {cardName} de R$ {amount} vence em 7 dias ({dueDate})."* |
| `INVOICE_REMINDER_DUE_DAY`| `FATURAS` | `WARNING` | Fatura Vence Hoje | *"Sua fatura do cartão {cardName} de R$ {amount} vence hoje!"* |
| `INVOICE_OVERDUE` | `FATURAS` | `URGENT` | Fatura Atrasada | *"Sua fatura do cartão {cardName} está fechada e precisa ser paga."* |
| `GOAL_REACHED` | `METAS` | `SUCCESS` | Meta Atingida! 🎉 | *"Parabéns! Sua meta "{goalTitle}" foi atingida!"* |
| `GOAL_REACHED_EARLY` | `METAS` | `SUCCESS` | Meta Atingida Antes do Prazo! 🚀 | *"🎉 Meta atingida antes do prazo! Parabéns pelo planejamento na meta "{goalTitle}"!"* |
| `GOAL_NO_ACTIVITY` | `METAS` | `WARNING` | Meta Sem Aportes | *"Sua meta "{goalTitle}" não recebeu nenhum aporte este mês. Que tal economizar um pouco hoje?"* |
| `GOAL_DEADLINE_7_DAYS` | `METAS` | `WARNING` | Prazo de Meta Próximo | *"Atenção: faltam 7 dias para o prazo da sua meta "{goalTitle}"."* |
| `GOAL_DEADLINE_PASSED` | `METAS` | `WARNING` | Prazo de Meta Encerrado | *"O prazo terminou para a sua meta "{goalTitle}" sem atingir o objetivo planejado."* |
| `BUDGET_PERCENT_80` | `ORCAMENTOS` | `WARNING` | Alerta de Orçamento (80%) | *"Você já utilizou 80% do seu orçamento de {categoryName}."* |
| `BUDGET_PERCENT_100` | `ORCAMENTOS` | `WARNING` | Limite de Orçamento Atingido | *"Você atingiu o limite definido para {categoryName}."* |
| `BUDGET_EXCEEDED` | `ORCAMENTOS` | `URGENT` | Orçamento Ultrapassado ⚠️ | *"Você ultrapassou o limite definido para {categoryName}."* |
| `MONTHLY_SUMMARY_AVAILABLE`| `RESUMO` | `INFO` | Resumo Financeiro Mensal | *"Seu resumo financeiro de {month} de {year} está disponível."* |

---

## Preferências de Notificação

O serviço conta com um mecanismo flexível de preferências individuais (`user_notification_preferences`), persistidas no banco PostgreSQL.
* **Comportamento Padrão**: No primeiro acesso ou consulta de preferências, caso o usuário não possua preferências cadastradas, o sistema cria um registro automático com **todas as preferências ativadas** (`true`).
* **Verificação de Disparo**: Antes de criar e persistir qualquer alerta no histórico, o método `isCategoryEnabled(userId, category)` é invocado de forma preventiva. Se a flag correspondente (ex: `receiveGoals = false`) estiver desativada, o processamento do evento é interrompido com sucesso e descartado silenciosamente, poupando espaço de persistência.

---

## Idempotência e Tratamento de Duplicidade

Como sistemas orientados a mensageria estão sujeitos a reentregas de mensagens em momentos de oscilações de rede (garantia de entrega *At-Least-Once*), o **Notification Service** implementa um mecanismo rígido de **Idempotência**:
* **Chave Única**: A tabela `notifications` define uma constraint única sobre o campo `event_id` (`uq_notifications_event_id`).
* **Como Funciona**: Cada evento gerado pelo microsserviço core de finanças viaja com um UUID único (`eventId`). Ao tentar persistir o alerta no banco do notification-service, se houver qualquer tentativa de inserção duplicada do mesmo `event_id`, a constraint única do PostgreSQL lançará uma exceção de integridade de dados no banco, garantindo de forma definitiva que o usuário **nunca receba a mesma notificação mais de uma vez** no seu painel.

---

## Segurança e Isolamento de Dados

* **Autenticação**: O serviço utiliza filtros stateless integrados ao Spring Security (`JwtAuthenticationFilter`) que extraem o UUID do usuário de dentro dos tokens JWT recebidos no cabeçalho HTTP `Authorization`.
* **Proteção contra IDOR (Insecure Direct Object Reference)**:
  Nenhum endpoint de alteração (`PUT`) ou exclusão (`DELETE`) confia apenas no ID da notificação enviado no caminho da URL. Os métodos JPA validam de forma conjunta o ID do registro e o UUID do usuário autenticado no contexto:
  ```java
  // Na camada Repository:
  Optional<Notification> findByIdAndUserId(UUID id, UUID userId);
  ```
  Isso impede de forma absoluta que um usuário consiga apagar ou marcar como lida uma notificação pertencente a outro usuário ao tentar adivinhar ou forjar UUIDs na rota `DELETE /api/notifications/{id}`.

---

## Modelo de Dados e Banco de Dados (PostgreSQL)

O banco de dados relacional utiliza o **Flyway** para gerenciar sua tabela de persistência de forma isolada:

### Migration (`V1__create_notifications_tables.sql`)
Cria a estrutura de armazenamento base:
1. **`notifications`**: Tabela que mantém o histórico de alertas. Define chaves primárias e a constraint de unicidade de eventos `uq_notifications_event_id`. Para otimizar as consultas frequentes do painel de notificações dos usuários e filtragens, são criados dois índices de alta performance:
   * `idx_notifications_user_id` (otimiza a busca por usuário logado).
   * `idx_notifications_is_read` (otimiza a contagem rápida de não lidas).
2. **`user_notification_preferences`**: Tabela de preferências de categorias por usuário (`uq_user_notification_preferences_user_id`).

---

## Principais Endpoints

### Recursos de Notificações (`/api/notifications`)

* `GET /api/notifications`: Lista o histórico completo de notificações do usuário autenticado por ordem de criação decrescente.
* `GET /api/notifications/unread/count`: Retorna o número total de notificações não lidas.
* `PUT /api/notifications/{id}/read`: Marca um alerta específico como lido.
* `PUT /api/notifications/read-all`: Marca todas as notificações do usuário como lidas.
* `DELETE /api/notifications/{id}`: Exclui um alerta do histórico.
* `GET /api/notifications/preferences`: Obtém as preferências de envio do usuário autenticado.
* `PUT /api/notifications/preferences`: Atualiza as preferências de envio do usuário autenticado (JSON contendo flags booleanas de faturas, metas, orçamentos e resumos).

---

## Schedulers e Processos Automáticos

O microsserviço gerencia uma rotina automatizada de retenção periódica de histórico para manter o banco limpo e performático:
* **Classe**: `NotificationRetentionScheduler` (ativada via `@Scheduled`).
* **Execução**: Diariamente, às **2:00 AM** (`cron = "0 0 2 * * *"`).
* **Regras de Expiração (Limpeza)**:
  * Alertas **Lidos** com mais de **5 dias** de criação são excluídos permanentemente.
  * Alertas **Não Lidos** com mais de **20 dias** de criação são limpos do sistema.

---

## Estrutura do Projeto

```text
notification-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/finflow/notificationservice/
    │   │   ├── config/             # Configurações de mensageria RabbitMQ
    │   │   ├── consumer/           # Listeners das filas do RabbitMQ
    │   │   ├── controller/         # APIs REST para listagem e preferências
    │   │   ├── dto/                # Records de entrada (eventos) e respostas (DTOs)
    │   │   ├── exception/          # Tratamento global de erros REST
    │   │   ├── mapper/             # Mapas de DTO/Entidade com MapStruct
    │   │   ├── model/              # Entidades Notification e Preference
    │   │   ├── repository/         # Consultas de banco JPA isoladas
    │   │   ├── security/           # Configuração stateless de segurança e filtro JWT
    │   │   └── service/            # Regras de preferência e alteração de alertas
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/       # Script Flyway V1 das tabelas
    └── test/
        └── java/com/finflow/notificationservice/
            ├── consumer/           # Testes unitários do consumidor de eventos
            ├── integration/        # Testes de integração Postgres e RabbitMQ via Testcontainers
            ├── scheduler/          # Testes unitários do job de expiração automática
            └── service/            # Testes unitários do serviço de preferências
```

---

## Configurações do Microsserviço

| Variável de Ambiente | Propriedade Spring | Utilidade do Parâmetro |
| :--- | :--- | :--- |
| `JWT_SECRET` | `jwt.secret` | Chave de verificação de assinatura base64 do JWT para rotas privadas |
| `server.port` | `server.port` | Porta HTTP oficial do microsserviço (porta: `8084`) |
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | Conexão JDBC dedicada do banco de notificações |
| `SPRING_RABBITMQ_HOST` | `spring.rabbitmq.host` | Endereço de rede do broker de mensagens RabbitMQ |
| `SPRING_RABBITMQ_PORT` | `spring.rabbitmq.port` | Porta de comunicação com o RabbitMQ (padrão: `5672`) |

*Nota: Variáveis com dados de conexões locais fictícias estão pré-definidas em perfis específicos de desenvolvimento para facilitar a inicialização rápida do portfólio. Segredos de produção devem ser gerenciados de forma externa.*

---

## Docker e Suíte de Testes

* **Dockerfile**: Build em múltiplos estágios baseado no JRE 21 oficial (`eclipse-temurin:21-jre`), expondo a porta `8084`.
* **Testes**:
  * **Unitários**: Cobertura de métodos de preferências em `NotificationServiceTest`, logs do consumidor em `NotificationConsumerTest` e lógica de intervalos de datas de limpeza em `NotificationRetentionSchedulerTest`.
  * **Integração com Testcontainers (`NotificationIntegrationTest.java`)**: Utiliza contêineres Docker temporários do **PostgreSQL** e do **RabbitMQ** rodando em paralelo para simular o recebimento assíncrono de mensagens reais e a persistência correta e idempotente com o banco relacional.
