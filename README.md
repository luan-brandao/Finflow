# Finflow — Sistema de Controle Financeiro Pessoal

O **Finflow** é uma plataforma moderna e resiliente de planejamento e controle financeiro pessoal, projetada sob a arquitetura de **Microsserviços** de alto desempenho orientados a eventos. O sistema permite que usuários registrem lançamentos, planejem orçamentos por categorias, configurem cartões de crédito e gerenciem suas metas de poupança sob uma experiência visual minimalista, limpa e fluida.

Este repositório é um **Monorepo** completo que unifica todas as aplicações e componentes do ecossistema Finflow: os microsserviços Java/Spring, as ferramentas de infraestrutura (Eureka, RabbitMQ, PostgreSQL) e a interface do usuário (React + TypeScript).

---

## 🏗️ Arquitetura de Microsserviços do Sistema

O Finflow adota o padrão de arquitetura distribuída stateless para garantir o máximo isolamento de falhas, escalabilidade horizontal e autonomia de dados:

```text
                               ┌──────────────────────────────────┐
                               │         Frontend (React)         │
                               │      (http://localhost:3000)     │
                               └────────────────┬─────────────────┘
                                                │
                                                ▼ Requisições HTTP REST
                               ┌──────────────────────────────────┐
                               │     API Gateway (Porta 8081)     │
                               └────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
    ┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
    │      USER-SERVICE      │     │    FINANCE-SERVICE     │     │  NOTIFICATION-SERVICE  │
    │      (Porta 8080)      │     │      (Porta 8082)      │     │      (Porta 8083)      │
    └──────────┬─────────────┘     └──────────┬─────────────┘     └──────────┬─────────────┘
               │                              │                              │
               │   Eventos de Negócio         │   Publica Eventos            │   Consome Eventos
               │   (Onboarding...)            │   (Metas, Limites, etc.)     │   (Assincronamente)
               │                              ▼                              ▼
               │                       ┌────────────────────────────────────────┐
               │                       │         RabbitMQ Message Broker        │
               │                       │            (Porta 5672)                │
               │                       └────────────────────────────────────────┘
               │                              │                              │
               ▼ Persistência                 ▼ Persistência                 ▼ Persistência
    ┌────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────┐
    │    PostgreSQL Users    │     │   PostgreSQL Finance   │     │ PostgreSQL Notifics    │
    │      (Porta 5432)      │     │  (Porta 5433 - DB 1)   │     │  (Porta 5433 - DB 2)   │
    └────────────────────────┘     └────────────────────────┘     └────────────────────────┘

    ────────────────────────────────────────────────────────────────────────────────────────
                               ┌──────────────────────────────────┐
                               │    Eureka Server (Porta 8761)    │  ◄── (Service Discovery)
                               └──────────────────────────────────┘
```

---

## 📦 Divisão dos Microsserviços e Componentes

Cada microsserviço no Finflow gerencia seu próprio contexto e banco de dados isolado. Para acessar a documentação detalhada e profunda das regras de negócios, DTOs, endpoints e testes de cada serviço, clique nos links relativos abaixo:

### 🌐 [API Gateway](./api-gateway/README.md)
Atua como o ponto de entrada síncrono único de todas as APIs, resolvendo a política de CORS para a comunicação segura com o frontend e distribuindo as requisições externas para o backend usando balanceamento de carga automático integrado ao Eureka.

### 🛡️ [User Service](./user-service/README.md)
Responsável pelo gerenciamento de identidade, autenticação stateless via tokens JWT, controle de perfis de usuário (`USER`, `ADMIN`), criptografia forte de senhas (BCrypt) e acompanhamento do onboarding inicial de novos perfis.

### 💰 [Finance Service](./finance-service/README.md)
O núcleo de regras de negócios financeiras. Processa transações de receitas e despesas, limites e faturas de cartões de crédito, orçamentos limitados por categoria e o controle progressivo de metas de poupança (Goals), gerando cálculos complexos de taxas de comprometimento de renda em tempo real.

### 🔔 [Notification Service](./notification-service/README.md)
Microsserviço reativo assíncrono que escuta as filas de mensageria do RabbitMQ e decide de forma automatizada, sob as preferências personalizadas de cada usuário, quais notificações estruturadas gerar, além de executar a retenção automática e expiração de dados históricos periódica de alertas.

### 📞 [Eureka Server](./eureka-server/README.md)
O servidor de descoberta de serviços (Service Discovery) que mantém a disponibilidade de rede ativa de todas as instâncias em execução, eliminando a dependência de mapeamento estático de endereços IP.

---

## 🛠️ Tecnologias Adotadas no Projeto

### Backend & Microsserviços
* **Java 21** & **Spring Boot 4.1.1** (Spring Core, WebMVC, Data JPA)
* **Spring Security & JWT** (Proteção stateless, segurança baseada em roles e criptografia BCrypt)
* **Spring Cloud WebMVC Gateway** (Roteamento e proxy reverso centralizado)
* **Spring Cloud Netflix Eureka Server** (Serviço de Registro e Descoberta)
* **io.jsonwebtoken (JJWT 0.12.6)** (Geração e decodificação de JSON Web Tokens)
* **MapStruct 1.5.5.Final** (Mapeamento performático em nível de compilação)
* **Lombok 1.18.42** (Redução de código boilerplate)

### Banco de Dados & Persistência
* **PostgreSQL 16** (Banco de dados de produção relacional)
* **Flyway Migration** (Gerenciamento automático de versionamento do schema do banco)

### Mensageria & Integração
* **RabbitMQ 3** (Message Broker AMQP de alto desempenho com suporte a Topic Exchange)

### Frontend (React App)
* **React 18** com **TypeScript** e build orquestrado por **Vite**
* **Tailwind CSS** (Estilização responsiva utility-first de alta fidelidade)
* **Lucide React** (Pacote de ícones minimalistas de interface)
* **React Router DOM** (Navegação dinâmica de rotas públicas e internas seguras)

---

## 🔄 Comunicação entre Serviços

### 1. Comunicação Síncrona (Gateway e Eureka)
Toda a comunicação síncrona iniciada pela interface do usuário entra pela porta `8081` do **API Gateway**. Usando o Eureka Client, o Gateway mapeia o nome lógico informado na rota (por exemplo, `lb://FINANCE-SERVICE`) para obter dinamicamente a porta ativa do microsserviço de destino, distribuindo o tráfego de requisições de forma balanceada.

### 2. Comunicação Assíncrona (Eventos e RabbitMQ)
Para garantir que o fluxo principal de requisições do usuário permaneça leve e sem gargalos, as comunicações entre serviços de negócio são **assíncronas e orientadas a eventos**:
* Quando um acontecimento financeiro ocorre (ex: meta atingida, fatura vencendo ou orçamento ultrapassado), o **Finance Service** publica um evento contendo um identificador único de rastreamento (`eventId`) e um payload de dados na exchange **`finflow.finance.exchange`** (do tipo `Topic`).
* O **Notification Service** escuta a fila vinculada **`finflow.notifications.queue`**, consome o evento e valida se o usuário possui essa categoria ativa em suas preferências, transformando-o em um alerta persistido no histórico pessoal de alertas de forma **idempotente** (bloqueando duplicidades de rede graças à chave única do `event_id` no banco).

---

## 🔒 Modelo Global de Segurança

* **Estratégia Stateless**: A segurança é implementada por meio de tokens JWT com expiração de 1 hora gerados pelo `user-service`.
* **Validação Descentralizada**: O API Gateway roteia as requisições sem validar o token. Cada microsserviço (`user-service`, `finance-service`, `notification-service`) possui seu próprio filtro de segurança que valida a assinatura do JWT individualmente usando a chave base64 simétrica compartilhada.
* **Prevenção de Acesso Cruzado (Isolamento IDOR)**: Os endpoints que manipulam recursos sensíveis (ex: atualizar despesa, consultar fatura, excluir meta) **nunca** confiam apenas no ID enviado na URL. O sistema valida se o `userId` presente nas claims do token coincide estritamente com o proprietário do registro no banco antes de autorizar qualquer operação.

---

## 🚀 Como Executar o Finflow Localmente

Esta seção detalha o roteiro para subir de forma ágil toda a estrutura integrada do Finflow em sua máquina.

### Pré-requisitos Reais
Certifique-se de ter instalado em seu computador:
1. **Git**
2. **Docker** & **Docker Compose**
3. **Node.js** (v18 ou superior, para executar o frontend de desenvolvimento)

---

### Passo 1: Clonar o Repositório
Abra o seu terminal de linha de comando e execute:
```bash
git clone <url-do-repositorio>
cd Finflow
```

### Passo 2: Subir a Infraestrutura e Serviços (Docker Compose)
Toda a infraestrutura de servidores, bancos de dados, broker de mensagens e os microsserviços do backend são compilados e executados por meio do Docker Compose unificado. No diretório raiz do projeto, execute:
```bash
docker compose up --build -d
```
*Esse comando fará o download das imagens do PostgreSQL e RabbitMQ, compilará individualmente os microsserviços em múltiplos estágios e subirá todos os contêineres em segundo plano (`-d`).*

### Passo 3: Executar a Interface do Usuário (Frontend)
Com o backend em plena execução, inicie a interface de usuário. Em uma nova janela de terminal, execute:
```bash
cd frontend
npm install
npm run dev
```
O aplicativo React iniciará e estará acessível em seu navegador no endereço: **`http://localhost:3000`**.

---

## 🔌 Tabela de Portas do Ecossistema Finflow

Para facilitar o mapeamento e testes, as portas oficiais utilizadas por cada componente estão detalhadas a seguir:

| Componente | Porta Interna (Contêiner) | Porta Host (Máquina) | Protocolo / Descrição |
| :--- | :---: | :---: | :--- |
| **Frontend App** | - | `3000` | HTTP / Interface React em execução local |
| **API Gateway** | `8081` | `8081` | HTTP / Ponto de Entrada unificado das requisições |
| **Eureka Server** | `8761` | `8761` | HTTP / Painel de Registro do Service Discovery |
| **User Service** | `8080` | `8080` | HTTP / APIs de Usuários e Autenticação JWT |
| **Finance Service** | `8082` | `8082` | HTTP / APIs Core Financeiras |
| **Notification Service** | `8083` | `8083` | HTTP / APIs de Preferências e Histórico de Alertas |
| **PostgreSQL (Users)** | `5432` | `5432` | JDBC / Banco isolado do User Service (`finflow_users`) |
| **PostgreSQL (Finance)** | `5432` | `5433` | JDBC / Banco do Finance e Notification (`finflow_finance`) |
| **RabbitMQ (Broker)** | `5672` | `5672` | AMQP / Porta de comunicação das filas assíncronas |
| **RabbitMQ (Dashboard)** | `15672` | `15672` | HTTP / Painel Administrativo Web das Filas |

---

## 🧪 Estratégia de Testes do Finflow

O ecossistema é suportado por uma cobertura abrangente de testes:
* **Testes Unitários**: Escritos de forma focada para validar os comportamentos e regras de negócio de services (como cálculo de limites de cartões e geração de tokens) isolando chamadas de banco através do Mockito.
* **Testes de Integração com Testcontainers**: Os microsserviços utilizam o JUnit 5 em conjunto com a biblioteca **Testcontainers** para instanciar contêineres Docker reais do **PostgreSQL** e do **RabbitMQ** de forma automatizada e limpa durante o ciclo de build dos testes. Isso garante que a integridade física de triggers, chaves primárias e concorrência de filas assíncronas seja testada contra bancos reais em tempo de compilação sem onerar o ambiente de desenvolvimento.

---

## 🎨 Decisão sobre Configurações e Dados Fictícios de Desenvolvimento

Como um projeto voltado à avaliação rápida de portfólio de engenharia de software e facilidade de demonstração, o repositório **contém chaves simétricas e credenciais padrão prontas para uso local** (como senhas do PostgreSQL e chaves JWT básicas inseridas nos arquivos de configuração do Compose e `.properties`).

Esses dados **são estritamente fictícios e de demonstração local**. Eles servem exclusivamente para permitir o fluxo simplificado `"clonar -> subir Docker Compose -> usar"` de forma ágil, confortável e acessível para recrutadores e avaliadores técnicos, sem a complexidade de configurar segredos manualmente no primeiro clone.

*⚠️ **Importante**: Em ambientes de produção reais, todas as chaves de assinatura JWT e credenciais de bancos de dados são fornecidas externamente através de mecanismos apropriados de injeção segura de segredos (como Vaults, AWS Secrets Manager ou variáveis de ambiente mascaradas de forma restrita).*

---

## 🚀 Melhorias Futuras / Próximos Passos

Como parte da evolução contínua do Finflow, as seguintes funcionalidades estão planejadas para implementação em versões futuras (atualmente **não** implementadas no projeto):

* **Login com Google (OAuth 2.0)**: Permitir que novos usuários criem contas e realizem login utilizando de forma integrada suas contas Google.
* **Recuperação de Senha**: Fluxo seguro e autônomo para solicitação de redefinição de senhas com envio de tokens temporários de verificação.
* **Swagger UI / OpenAPI**: Integração de documentação interativa OpenAPI/Swagger para todas as APIs públicas dos microsserviços, facilitando a exploração rápida e direta de rotas por desenvolvedores parceiros.

---

## 📂 Estrutura Simplificada de Pastas

```text
Finflow/                             # Diretório Raiz do Repositório (Monorepo)
├── api-gateway/                     # Gateway de Roteamento de Requisições
├── eureka-server/                   # Servidor de Descoberta de Serviços (Registry)
├── user-service/                    # Microsserviço de Identidade e Contas
├── finance-service/                 # Microsserviço Core de Finanças e Dashboard
├── notification-service/            # Microsserviço Reativo de Alertas e Retenção
├── frontend/                        # Interface Web em React + TypeScript + Tailwind
├── postgres-finance-init/           # Scripts SQL de inicialização física dos bancos de dados
├── docker-compose.yml               # Arquivo mestre de orquestração do ecossistema local
└── README.md                        # Apresentação Geral da Plataforma (Este arquivo)
```
