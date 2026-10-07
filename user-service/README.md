# Finflow — User Service

O **User Service** é um microsserviço essencial da plataforma Finflow, responsável pela segurança, gestão de identidade, controle de acessos (RBAC), cadastro de contas de usuários e fluxos de onboarding. Ele atua como o alicerce de identidade para os demais serviços da plataforma.

---

## Responsabilidades

O microsserviço é responsável pelas seguintes operações:
1. **Gerenciamento de Contas**: Registro de novos usuários e manutenção de dados cadastrais.
2. **Autenticação e Emissão de Identidade**: Login baseado em credenciais seguras e emissão de tokens JWT (JSON Web Tokens) assinados de forma stateless.
3. **Controle de Acesso**: Definição de perfis de usuário (`USER`, `ADMIN`) para restrição de rotas e operações.
4. **Fluxo de Onboarding**: Registro do estado de conclusão de introdução (`onboardingCompleted`) para personalização do primeiro acesso no frontend.

---

## Principais Funcionalidades

* **Registro de Usuários**: Cadastro público seguro com criptografia de senha e validação de formato de e-mail e tamanho do nome (limite de 20 caracteres).
* **Autenticação JWT**: Geração de tokens JWT com expiração de 1 hora, contendo claims personalizadas como ID e Role.
* **Busca e Atualização de Perfil**: Endpoints específicos para os usuários buscarem e editarem suas próprias informações cadastrais (`/me`) de forma isolada.
* **Painel Administrativo (Roles)**: Operações avançadas exclusivas para administradores (`ADMIN`), incluindo listagem de usuários com paginação, busca individual por ID e exclusão de contas.
* **Exclusão de Conta Self-Service**: Permissão para que o usuário logado exclua sua própria conta de forma autônoma.
* **Onboarding Progressivo**: Endpoint específico para registrar a conclusão do guia de boas-vindas do usuário.

---

## Tecnologias e Bibliotecas Utilizadas

* **Java 21**: Versão da linguagem de programação adotada.
* **Spring Boot 4.1.1**: Framework base para o desenvolvimento do serviço.
* **Spring Security & BCrypt**: Camada robusta para proteção de endpoints e criptografia forte de senhas (via hash BCrypt).
* **Spring Data JPA & Hibernate**: Camada de persistência relacional para comunicação orientada a objetos.
* **PostgreSQL (Driver JDBC)**: Banco de dados relacional oficial de produção.
* **Flyway**: Ferramenta de versionamento e execução automática de migrations do banco de dados.
* **io.jsonwebtoken (JJWT 0.12.6)**: Biblioteca para assinatura, estruturação e decodificação segura de tokens JWT.
* **MapStruct 1.5.5.Final**: Processador de anotações para mapeamento performático entre DTOs e entidades JPA em tempo de compilação.
* **Lombok 1.18.42**: Biblioteca de produtividade para geração automática de getters, setters, construtores e builders.
* **Spring Cloud Netflix Eureka Client**: Cliente de registro e descoberta automática de microsserviços.
* **Maven**: Gerenciador oficial de compilação e dependências.

---

## Arquitetura e Estrutura de Pastas

O projeto adota o padrão de arquitetura em camadas tradicionais de microsserviços Spring, organizando suas responsabilidades da seguinte forma:

```text
user-service/
├── Dockerfile
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/finflow/userservice/
    │   │   ├── UserServiceApplication.java    # Classe de inicialização Spring Boot
    │   │   ├── config/                        # Configurações de Segurança e PasswordEncoder
    │   │   ├── controller/                    # Controladores REST públicos e privados
    │   │   ├── exception/                     # Tratamento global de erros (@ControllerAdvice)
    │   │   ├── mapper/                        # Mapeamentos automatizados com MapStruct
    │   │   ├── model/                         # Entidades JPA (User) e Enums (Role)
    │   │   ├── repository/                    # Interfaces de acesso ao banco (Spring Data JPA)
    │   │   ├── security/                      # Filtro de interceptação de requisição JWT
    │   │   ├── service/                       # Regras de negócio e geração de tokens
    │   │   └── tdo/                           # Objetos de Transferência de Dados (DTOs)
    │   └── resources/
    │       ├── application.properties         # Configurações globais e de produção
    │       ├── application-test.properties    # Configurações específicas para ambiente de testes
    │       └── db/migration/                  # Scripts SQL de controle de versão do banco
    └── test/
        └── java/com/finflow/userservice/      # Testes unitários, de integração e Testcontainers
```

*Nota: O pacote de DTOs possui o nome físico `tdo` na estrutura do projeto.*

---

## Autenticação e Segurança

### Fluxo de Validação de Identidade (Stateless)
A autenticação do Finflow é do tipo **Stateless** (sem estado). O microsserviço de usuários não mantém sessões em memória.

```text
[Cliente] -> Envia Credenciais -> [AuthController]
[AuthController] -> Autentica -> [JwtService] -> Retorna JWT assinado
[Cliente] -> Próxima Requisição com Header "Authorization: Bearer <JWT_TOKEN>" -> [JwtAuthenticationFilter]
```

1. **Geração do Token**: Após a validação das credenciais de e-mail e senha correspondentes ao hash BCrypt, o `JwtService` constrói o token:
   * **Subject**: UUID do Usuário.
   * **Claims**: Chave `"role"` contendo a Role do usuário (`USER` ou `ADMIN`).
   * **Algoritmo de Assinatura**: HMAC-SHA256 (`HS256`) com chave simétrica configurada.
   * **Expiração**: 1 Hora.
2. **Interceptação por Filtro (`JwtAuthenticationFilter`)**: Em cada rota protegida, o filtro intercepta a requisição, extrai o token do cabeçalho `Authorization: Bearer <JWT_TOKEN>`, valida a assinatura com a chave secreta e injeta o objeto `UsernamePasswordAuthenticationToken` no `SecurityContextHolder` do Spring.
3. **Isolamento de Dados**: Os endpoints privados que realizam ações do usuário logado (como busca do próprio perfil ou exclusão) utilizam **`Authentication.getName()`** para ler o ID do usuário diretamente do token JWT decodificado de forma segura. Isso garante que um usuário autenticado jamais consiga visualizar ou manipular dados pertencentes a outro UUID de usuário.

---

## Modelo de Dados e Entidades

### Entidade `User`
A tabela física é representada pela entidade JPA `User`, contendo as seguintes propriedades:

| Propriedade | Tipo Java | Coluna PostgreSQL | Detalhes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `id` (PK) | Gerado automaticamente |
| `name` | `String` | `name` | Máximo de 20 caracteres |
| `email` | `String` | `email` (Unique) | Formato válido de e-mail |
| `password` | `String` | `password` | Hash seguro BCrypt |
| `role` | `Role` (Enum) | `role` | Valores restritos a `USER` ou `ADMIN` |
| `onboardingCompleted` | `boolean` | `onboarding_completed` | Inicializado como `false` |
| `created` | `LocalDateTime`| `created` | Data de criação automática (@CreationTimestamp) |
| `updated` | `LocalDateTime`| `updated` | Data de atualização automática (@UpdateTimestamp) |

---

## Banco de Dados e Migrations

O serviço gerencia de maneira rigorosa a integridade do seu banco relacional usando **Flyway** integrado à validação do Hibernate (`spring.jpa.hibernate.ddl-auto=validate`).

### Scripts de Migration (`db/migration`)
As tabelas e colunas são provisionadas em ordem cronológica de migrações estruturadas em SQL padrão:
* **`V1__create_users_table.sql`**: Cria a tabela básica `users`, definindo a chave primária `pk_users` baseada em UUID, a constraint única `uk_users_email` para impedir cadastros duplicados com o mesmo endereço de e-mail, e uma constraint de checagem de regras de role (`chk_users_role`) para restringir os valores inseridos aos tipos `ADMIN` e `USER`.
* **`V2__add_onboarding_completed_to_users.sql`**: Altera a tabela adicionando a coluna de controle booleana `onboarding_completed`, inicializada com o valor padrão `FALSE` para todas as contas.

---

## Principais Endpoints

### Autenticação (`/api/auth`)

#### 1. Criar Nova Conta
* **Método**: `POST`
* **Rota**: `/api/auth/register`
* **Autenticação**: Pública (Qualquer pessoa pode acessar)
* **Corpo da Requisição (`UserRequestDTO`)**:
  ```json
  {
    "name": "Luan Brandão",
    "email": "luan@finflow.com",
    "password": "senha_segura_aqui"
  }
  ```
* **Resposta esperada (`210 Created`)**: Retorna os dados do usuário criado sem a senha em formato de hash.

#### 2. Efetuar Login
* **Método**: `POST`
* **Rota**: `/api/auth/login`
* **Autenticação**: Pública
* **Corpo da Requisição (`LoginRequestDTO`)**:
  ```json
  {
    "email": "luan@finflow.com",
    "password": "senha_segura_aqui"
  }
  ```
* **Resposta esperada (`200 OK`)**:
  ```json
  {
    "token": "<JWT_TOKEN>",
    "type": "Bearer"
  }
  ```

---

### Gestão de Usuários (`/api/users`)

#### 1. Buscar Meus Próprios Dados
* **Método**: `GET`
* **Rota**: `/api/users/me`
* **Autenticação**: Requer token JWT válido no Header.

#### 2. Atualizar Meu Cadastro
* **Método**: `PUT`
* **Rota**: `/api/users/me`
* **Autenticação**: Requer token JWT válido no Header.
* **Corpo da Requisição (`UserUpdateDTO`)**: Permite alterar o e-mail, nome e senha.

#### 3. Concluir Guia de Onboarding
* **Método**: `PUT`
* **Rota**: `/api/users/me/onboarding`
* **Autenticação**: Requer token JWT válido no Header.
* **Resposta**: Atualiza o campo `onboardingCompleted` para `true` e retorna o perfil atualizado.

#### 4. Excluir Minha Própria Conta
* **Método**: `DELETE`
* **Rota**: `/api/users/me`
* **Autenticação**: Requer token JWT válido no Header.
* **Resposta**: `204 No Content` (Sucesso).

#### 5. Listar Todos os Usuários (Administrativo)
* **Método**: `GET`
* **Rota**: `/api/users`
* **Autenticação**: Requer perfil de acesso `ADMIN`. Suporta paginação automática do Spring Data (`?page=0&size=10&sort=name`).

---

## Configurações do Microsserviço

As propriedades de execução do microsserviço são lidas dinamicamente a partir de variáveis de ambiente.

| Chave de Configuração | Propriedade Spring | Propósito |
| :--- | :--- | :--- |
| `JWT_SECRET` | `jwt.secret` | Chave simétrica em base64 utilizada para a assinatura/verificação do JWT |
| `server.port` | `server.port` | Porta oficial onde a API REST é exposta (padrão: `8080`) |
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | URL de conexão JDBC do banco de dados PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | Nome de usuário de autenticação do PostgreSQL |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | Senha de autenticação do PostgreSQL |
| `spring.jpa.hibernate.ddl-auto` | `spring.jpa.hibernate.ddl-auto` | Configurado como `validate` para assegurar que o banco condiz com a entidade |

### Abordagem de Variáveis de Desenvolvimento e Segurança
Pensando em facilitar a avaliação ágil do projeto por terceiros (como recrutadores, revisores ou desenvolvedores que desejam analisar o código sem dezenas de passos de configuração local), o projeto disponibiliza algumas configurações locais fictícias pré-definidas em perfis específicos de ambiente (como em Docker Compose de teste ou perfis locais).

Essas credenciais e chaves (como segredos JWT padrão ou senhas locais de containers) são **exclusivamente fictícias de demonstração** e não representam de forma alguma informações em ambiente de produção.
Em ambientes produtivos oficiais, todas essas credenciais sensíveis devem ser fornecidas por meio de gerenciadores de segredos seguros (como Secret Managers ou Vaults) e fornecidas de maneira externa, sem expor chaves no repositório.

---

## Integrações do Serviço

* **Eureka Server**: No bootstrap do serviço, o Eureka Client realiza a descoberta e registro de serviços na rede de containers internos através de `eureka.client.service-url.defaultZone=http://eureka-server:8761/eureka`.
* **API Gateway**: Atua em conjunto na camada de segurança. O Gateway valida ou repassa o token para o microsserviço, que realiza a verificação de autenticação rigorosa e do RBAC (Role-Based Access Control) por requisição.
* **PostgreSQL**: Comunicação exclusiva direta para persistência relacional do schema de usuários.

---

## Empacotamento Docker

O microsserviço utiliza um processo de compilação em múltiplos estágios (**Multi-stage Build**) para manter a imagem final o mais leve possível:

1. **Estágio de Build (`build`)**: Usa uma imagem Maven oficial com JDK 21 (`maven:3.9-eclipse-temurin-21`) para compilar o código de forma isolada, baixar dependências e gerar o arquivo empacotado `.jar` ignorando a execução de testes pesados de integração.
2. **Estágio de Execução**: Copia apenas o `.jar` gerado do estágio anterior para uma imagem mínima baseada em Alpine/Ubuntu JRE (`eclipse-temurin:21-jre`), expondo a porta HTTP `8080`.

---

## Testes Automatizados

O serviço possui uma suíte robusta de testes para mitigar regressões e garantir cobertura de alta fidelidade:

* **Testes Unitários (`UserServiceTest.java`)**: Focados exclusivamente na camada de serviços. Usam dublês de testes (mocks) estruturados com Mockito para simular o banco de dados e mapeamentos, testando validações de login, tentativas de registro duplicado, busca de perfis e atualizações de onboarding.
* **Testes de Integração com Testcontainers**:
  * **`UserControllerIntegrationTest.java`**: Executa requisições HTTP MockMvc simuladas contra o contexto real do Spring Security, garantindo a validação de cabeçalhos JWT, rejeição de rotas restritas por Role e controle de onboarding.
  * **`UserServiceIntegrationTest.java`**: Valida o fluxo de regras de negócio persistindo e manipulando dados integrados ao banco PostgreSQL real.
  * **`UserRepositoryIntegrationTest.java`**: Valida o funcionamento de consultas personalizadas escritas no repositório contra um banco de dados real PostgreSQL instanciado dinamicamente durante os testes via contêiner oficial do Docker.
