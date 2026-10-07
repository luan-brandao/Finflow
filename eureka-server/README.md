# Finflow — Eureka Discovery Server

O **Eureka Server** é o servidor de registro e descoberta de serviços (Service Discovery) da arquitetura de microsserviços do Finflow. Baseado na tecnologia Netflix Eureka, ele atua como a lista telefônica centralizada do sistema, onde cada instância de microsserviço ativa se cadastra automaticamente e anuncia seu endereço de rede dinâmico.

---

## Responsabilidades e Objetivo

Em uma arquitetura de microsserviços rodando em contêineres Docker, os IPs e as portas das instâncias dos serviços são dinâmicos e efêmeros (mudam a cada deploy, reinicialização ou escalabilidade). 

O **Eureka Server** resolve este problema:
* **Descoberta Dinâmica de Serviços**: Elimina a necessidade de "chubar" (hardcodar) caminhos ou endereços IP nos arquivos de configuração dos microsserviços.
* **Comunicação por Nome de Serviço**: Os microsserviços se comunicam usando apenas o nome lógico do serviço (ex: `finance-service`), enquanto o Eureka resolve o IP e a porta de forma transparente em tempo de execução.
* **Resiliência e Desacoplamento**: Se uma instância falha ou uma nova é adicionada para escalonamento, o Eureka Server atualiza seu catálogo em tempo real, permitindo que o API Gateway redirecione requisições apenas para instâncias saudáveis.

---

## Fluxo do Service Discovery

O ciclo de vida de registro e descoberta de instâncias no Finflow opera sob o seguinte fluxo:

```text
  ┌─────────────────┐             ┌──────────────────────┐             ┌─────────────────────┐
  │   USER-SERVICE  │             │   FINANCE-SERVICE    │             │ NOTIFICATION-SERVICE│
  │ (Eureka Client) │             │   (Eureka Client)    │             │   (Eureka Client)   │
  └────────┬────────┘             └──────────┬───────────┘             └──────────┬──────────┘
           │                                 │                                    │
           │ Registra-se                     │ Registra-se                        │ Registra-se
           ▼                                 ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     EUREKA SERVER                                          │
│                             (Cataloga instâncias ativas)                                   │
└────────────────────────────────────────────▲───────────────────────────────────────────────┘
                                             │
                                             │ Consulta o catálogo
                                             │ para Load Balancing
                                    ┌────────┴────────┐
                                    │   API GATEWAY   │
                                    │ (Eureka Client) │
                                    └─────────────────┘
```

---

## Serviços Registrados no Eureka

Todas as instâncias configuradas com a propriedade do Eureka Client participam do ecossistema de descoberta:
1. **`USER-SERVICE`**: Cadastra-se na porta dinâmica (ou padrão `8080`).
2. **`FINANCE-SERVICE`**: Cadastra-se na porta dinâmica (ou padrão `8082`).
3. **`NOTIFICATION-SERVICE`**: Cadastra-se na porta dinâmica (ou padrão `8084`).
4. **`API-GATEWAY`**: Cadastra-se no Eureka para ler de forma síncrona o catálogo de microsserviços e aplicar o balanceamento de carga automático.

---

## Tecnologias Utilizadas

* **Java 21**: Versão oficial da linguagem.
* **Spring Boot 4.1.1**: Framework para gerenciamento e inicialização simplificada da aplicação.
* **Spring Cloud Starter Netflix Eureka Server (Spring Cloud 2025.1.3)**: Módulo de servidor de catálogo Eureka.
* **Maven**: Gerenciamento de dependências e automação de builds.

---

## Configuração do Eureka Server

O arquivo de propriedades do Eureka Server (`application.properties`) é extremamente enxuto e desativa comportamentos de cliente para si mesmo:

```properties
spring.application.name=eureka-server

server.port=8761

# Desativa o comportamento padrão de o servidor tentar se registrar nele mesmo
eureka.client.register-with-eureka=false

# Desativa a busca pelo catálogo local para evitar loops desnecessários
eureka.client.fetch-registry=false
```

### Explicação das Propriedades
* **`server.port=8761`**: Porta padrão oficial do ecossistema Spring Cloud Eureka.
* **`register-with-eureka=false`**: Impede que este servidor tente se registrar como um cliente em seu próprio catálogo de serviços.
* **`fetch-registry=false`**: Impede que a instância tente baixar de si mesma o catálogo de serviços durante o ciclo de atualização interna de caches.

---

## Empacotamento e Execução via Docker

O Eureka Server é empacotado através de um **Dockerfile** de múltiplos estágios:

* **Estágio de Build**: Compila a aplicação usando JDK 21 oficial (`maven:3.9-eclipse-temurin-21`) gerando o arquivo compactado executável `app.jar`.
* **Estágio de Execução**: Executa a aplicação sob uma JRE enxuta e limpa (`eclipse-temurin:21-jre`).
* **Porta Exposta**: `8761`.
* **Relação com o Docker Compose**: No fluxo de inicialização do Docker Compose geral do Finflow, o Eureka Server é o **primeiro** serviço a ser inicializado, pois todos os microsserviços core dependem da disponibilidade do seu catálogo para poderem se registrar.

---

## Testes

O serviço de descoberta de serviços não possui testes unitários ou de integração de negócio específicos mapeados no código, possuindo apenas o teste padrão de sanidade de contexto (`UserServiceApplicationTests`-like):
* `EurekaServerApplicationTests`: Garante que o contexto da aplicação Spring Boot inicializa e carrega todas as dependências básicas sem erros.

---

## Estrutura do Projeto

```text
eureka-server/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/finflow/eurekaserver/
    │   │   └── EurekaServerApplication.java    # Ativador @EnableEurekaServer
    │   └── resources/
    │       └── application.properties          # Propriedades de porta e cliente do Eureka
    └── test/
        └── java/com/finflow/eurekaserver/
            └── EurekaServerApplicationTests.java
```
