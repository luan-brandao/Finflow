# Finflow — API Gateway

O **API Gateway** é o ponto de entrada único (Single Entry Point) e unificado para todas as requisições externas direcionadas ao ecossistema do Finflow. Ele é responsável por centralizar, padronizar e rotear o tráfego externo para os respectivos microsserviços do backend, além de gerenciar de forma global as políticas de compartilhamento de recursos (CORS).

---

## Responsabilidades e Objetivo

O API Gateway executa as seguintes responsabilidades estruturais na plataforma:
1. **Ponto Único de Entrada**: Centraliza todas as chamadas provenientes do Frontend React em um único endereço IP e porta, simplificando as requisições do cliente.
2. **Roteamento Dinâmico**: Redireciona de forma transparente cada requisição HTTP para o microsserviço correspondente ao caminho acessado.
3. **Balanceamento de Carga Automático (Load Balancing)**: Distribui as requisições entre múltiplas instâncias dos microsserviços integrando-se dinamicamente ao Discovery Server Eureka.
4. **Resolução Global de CORS**: Intercepta requisições de origens cruzadas (provenientes de domínios diferentes da API) e injeta as regras de cabeçalho permitindo o consumo seguro pelo navegador.

---

## Fluxo das Requisições na Arquitetura

O fluxo completo de roteamento de ponta a ponta segue a ordem abaixo:

```text
       Frontend (React)
    (http://localhost:3000)
              │
              ▼ Requisição HTTP (ex: GET /api/transactions)
       ┌──────────────┐
       │ API GATEWAY  │ ◄─── (CORS resolvido globalmente)
       └──────┬───────┘
              │
              │ Resolve o nome lógico "FINANCE-SERVICE"
              ▼
       ┌──────────────┐
       │EUREKA SERVER │ (Cataloga IPs e portas dinâmicos das instâncias)
       └──────┬───────┘
              │
              │ Encaminha para instância disponível (Load Balancing)
              ▼
       ┌──────────────┐
       │ FINANCE-SERV │ (Executa validação local de JWT e lógica de negócio)
       └──────────────┘
```

---

## Rotas Mapeadas (Roteamento de Serviços)

O roteamento é configurado de maneira declarativa em propriedades no arquivo de configuração do gateway. Todas as rotas utilizam o prefixo lógico `/api/` e delegam o balanceamento de carga para o Eureka através do esquema de protocolo `lb://`.

| Identificador da Rota (`id`) | Caminho Predicado (`Path`) | Serviço de Destino | Load Balancing (`lb://`) | Objetivo |
| :--- | :--- | :--- | :--- | :--- |
| `user-service` | `/api/users/**` | `USER-SERVICE` | `Sim` | Rotas de consulta e manipulação de perfis de usuário |
| `user-service-auth` | `/api/auth/**` | `USER-SERVICE` | `Sim` | Endpoints públicos de login, registro e tokens |
| `finance-service` | `/api/categories/**` | `FINANCE-SERVICE` | `Sim` | Gestão de categorias de gastos |
| `finance-service-transactions`| `/api/transactions/**`| `FINANCE-SERVICE` | `Sim` | Lançamento de despesas, receitas e aportes |
| `finance-service-dashboard` | `/api/dashboard/**` | `FINANCE-SERVICE` | `Sim` | Relatórios consolidados e taxas de renda |
| `finance-service-cards` | `/api/cards/**` | `FINANCE-SERVICE` | `Sim` | Cadastro e adiantamento de limites de cartões |
| `finance-service-monthly-income`| `/api/monthly-income/**`| `FINANCE-SERVICE`| `Sim` | Definição de renda de referência mensal |
| `finance-service-goals` | `/api/goals/**` | `FINANCE-SERVICE` | `Sim` | Cadastro e alteração de metas de poupança |
| `notification-service` | `/api/notifications/**`| `NOTIFICATION-SERVICE`| `Sim` | Listagem, leitura e preferências de alertas |

---

## Integração com Eureka e Load Balancing (`lb://`)

Diferente de gateways tradicionais que precisam mapear os IPs e portas fixos de cada microsserviço (ex: `http://192.168.1.50:8082`), o API Gateway do Finflow utiliza o Spring Cloud LoadBalancer:
* **Mecanismo**: Ao receber a requisição, o gateway lê o protocolo especial `lb://` configurado na URI da rota (ex: `lb://FINANCE-SERVICE`).
* **Consulta ao Eureka**: O gateway consulta o Eureka Server, localiza as instâncias saudáveis e ativas registradas sob o nome lógico correspondente (`FINANCE-SERVICE`) e repassa a requisição aplicando balanceamento de carga de forma dinâmica.

---

## Políticas de Segurança no Gateway

### ⚠️ Descentralização e Delegação de Autenticação JWT
Uma decisão técnica importante na arquitetura do Finflow é a **descentralização da segurança**:
* **O papel do Gateway**: O API Gateway **não** decodifica, valida ou expira tokens JWT, e **não** realiza autenticação ou autorização de rotas na sua própria camada. Ele foca estritamente no papel de proxy reverso e balanceador de carga.
* **O papel dos Microsserviços**: A responsabilidade de decodificar e validar a integridade dos cabeçalhos `Authorization: Bearer <JWT_TOKEN>` é delegada de forma downstream para cada microsserviço final que recebe o tráfego roteado. Cada serviço de negócio possui seu próprio `JwtAuthenticationFilter` e regras de autorização via Spring Security.

---

## Configuração de CORS (Compartilhamento de Origem)

Para permitir a comunicação do Frontend do Finflow de forma transparente, o API Gateway define globalmente o tratamento de **CORS (Cross-Origin Resource Sharing)** na classe Java `CorsConfig`:

```java
// No CorsConfig.java:
CorsConfiguration configuration = new CorsConfiguration();
configuration.setAllowedOrigins(List.of("http://localhost:3000"));
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true);
```

### Regras Globais Configuradas
* **Origins Permitidas**: `http://localhost:3000` (URL oficial do ambiente local de desenvolvimento do React).
* **Métodos Permitidos**: `GET`, `POST`, `PUT`, `DELETE` e `OPTIONS` (permitindo preflight requests).
* **Cabeçalhos Permitidos**: Todos (`*`), viabilizando o envio do cabeçalho personalizado `Authorization` contendo o JWT do usuário.
* **Credenciais**: Habilitado (`true`), viabilizando a transmissão segura de cookies ou cabeçalhos de autenticação de sessão.

---

## Tecnologias Utilizadas

* **Java 21**: Versão da linguagem de programação.
* **Spring Boot 4.1.1**: Framework base do serviço.
* **Spring Cloud Starter Gateway Server WebMVC**: Versão do gateway configurada sob Tomcat/Servlet tradicional (WebMVC), simplificando a compatibilidade de desenvolvimento com APIs web.
* **Spring Cloud Netflix Eureka Client**: Integração nativa para busca síncrona de catálogos de microsserviços.
* **Maven**: Gerenciamento de ciclo de vida e compilação de artefatos.

---

## Configurações do Gateway (`application.properties`)

| Propriedade Spring | Utilidade do Parâmetro |
| :--- | :--- |
| `server.port=8081` | Porta HTTP na qual o Gateway atende todas as requisições externas do Frontend |
| `spring.cloud.gateway.server.webmvc.routes` | Array declarativo que especifica identificadores, padrões de caminhos e destinos das rotas |
| `eureka.client.service-url.defaultZone` | Endereço URL de comunicação para obter o catálogo do Eureka Server |

---

## Empacotamento Docker

O API Gateway é construído e disponibilizado sob as seguintes especificações do **Dockerfile**:
* **Processo**: Compilação via múltiplos estágios Maven com JDK 21 (`maven:3.9-eclipse-temurin-21`) gerando o arquivo executável enxuto `app.jar` livre de dependências adicionais desnecessárias.
* **Runtime**: Executa sobre uma JRE limpa do Eclipse Temurin (`eclipse-temurin:21-jre`).
* **Porta exposta**: `8081`.

---

## Estrutura do Projeto

```text
api-gateway/
├── Dockerfile
├── pom.xml
└── src/
    └── main/
        ├── java/com/finflow/apigateway/
        │   ├── ApiGatewayApplication.java     # Inicialização Spring Boot
        │   └── config/
        │       └── CorsConfig.java             # Injeção de bean global CorsFilter
        └── resources/
            └── application.properties          # Propriedades de roteamento WebMVC e Eureka
```
