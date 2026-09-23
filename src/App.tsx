import { useState } from 'react';
import { 
  Activity, 
  Database, 
  Network, 
  PlayCircle, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  BookOpen, 
  Settings, 
  Layers, 
  ArrowRight,
  Server,
  Lock,
  UserCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'tests' | 'endpoints'>('tests');
  const [copiedCommand, setCopiedCommand] = useState(false);

  const copyTestCommand = () => {
    navigator.clipboard.writeText('cd user-service && ./mvnw test');
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-blue-600 rounded-lg text-white animate-pulse">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 class="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Finflow
            </h1>
            <p class="text-xs text-slate-400">Ambiente de Desenvolvimento & Testes</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Servidor Online
          </span>
          <span class="text-xs text-slate-500">Porta: 3000</span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Microservices Status Cards */}
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Eureka Server */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition duration-300">
            <div class="flex justify-between items-start mb-3">
              <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Network className="h-5 w-5" />
              </div>
              <span class="px-2 py-0.5 text-2xs font-semibold rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                Discovery
              </span>
            </div>
            <h3 class="font-bold text-base text-slate-200">eureka-server</h3>
            <p class="text-xs text-slate-400 mt-1 mb-4">Registro e descoberta dinâmica de instâncias de microsserviços.</p>
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span class="flex items-center"><Server class="h-3.5 w-3.5 mr-1 text-slate-500" /> Porta 8761</span>
              <span class="text-indigo-400 font-semibold">Ativo</span>
            </div>
          </div>

          {/* API Gateway */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition duration-300">
            <div class="flex justify-between items-start mb-3">
              <div class="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <span class="px-2 py-0.5 text-2xs font-semibold rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                Routing
              </span>
            </div>
            <h3 class="font-bold text-base text-slate-200">api-gateway</h3>
            <p class="text-xs text-slate-400 mt-1 mb-4">Porta de entrada unificada com roteamento inteligente.</p>
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span class="flex items-center"><Server class="h-3.5 w-3.5 mr-1 text-slate-500" /> Porta 8060</span>
              <span class="text-cyan-400 font-semibold">Ativo</span>
            </div>
          </div>

          {/* User Service */}
          <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition duration-300">
            <div class="flex justify-between items-start mb-3">
              <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <span class="px-2 py-0.5 text-2xs font-semibold rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                Service
              </span>
            </div>
            <h3 class="font-bold text-base text-slate-200">user-service</h3>
            <p class="text-xs text-slate-400 mt-1 mb-4">Gerenciamento de usuários, perfis, e autenticação JWT.</p>
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span class="flex items-center"><Server class="h-3.5 w-3.5 mr-1 text-slate-500" /> Porta 8080</span>
              <span class="text-blue-400 font-semibold">Ativo</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div class="border-b border-slate-800 flex space-x-6">
          <button 
            onClick={() => setActiveTab('tests')}
            class={`pb-3 text-sm font-medium transition duration-200 relative ${activeTab === 'tests' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Suíte de Testes de Integração
          </button>
          <button 
            onClick={() => setActiveTab('architecture')}
            class={`pb-3 text-sm font-medium transition duration-200 relative ${activeTab === 'architecture' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Arquitetura do Sistema
          </button>
          <button 
            onClick={() => setActiveTab('endpoints')}
            class={`pb-3 text-sm font-medium transition duration-200 relative ${activeTab === 'endpoints' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Endpoints & APIs
          </button>
        </div>

        {/* Tab Contents */}
        <section class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm min-h-[400px]">
          
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div class="space-y-6">
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-lg font-bold text-slate-200">Mapa de Comunicação dos Microsserviços</h2>
                  <p class="text-xs text-slate-400">Visualize como os componentes se integram e realizam a descoberta.</p>
                </div>
              </div>

              {/* Visual Diagram */}
              <div class="border border-slate-800 bg-slate-950/80 rounded-xl p-8 flex flex-col md:flex-row justify-around items-center space-y-8 md:space-y-0 relative overflow-hidden">
                <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]"></div>
                
                {/* Client / Gateway */}
                <div class="z-10 bg-slate-900 border border-slate-700 rounded-xl p-4 w-44 text-center shadow-lg relative group hover:border-blue-500 transition duration-300">
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600/10 text-blue-400 text-3xs font-bold uppercase px-2 py-0.5 rounded border border-blue-500/20">
                    Ponto de Entrada
                  </div>
                  <Layers class="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <span class="font-bold text-xs block text-slate-200">api-gateway</span>
                  <span class="text-3xs text-slate-400 block mt-1">Porta: 8060</span>
                </div>

                <ArrowRight class="hidden md:block h-6 w-6 text-slate-600" />

                {/* Service Discovery */}
                <div class="z-10 bg-slate-900 border border-indigo-900/50 rounded-xl p-4 w-44 text-center shadow-lg relative group hover:border-indigo-500 transition duration-300">
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600/10 text-indigo-400 text-3xs font-bold uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                    Registro de Serviços
                  </div>
                  <Network class="h-6 w-6 mx-auto mb-2 text-indigo-400" />
                  <span class="font-bold text-xs block text-slate-200">eureka-server</span>
                  <span class="text-3xs text-slate-400 block mt-1">Porta: 8761</span>
                </div>

                <ArrowRight class="hidden md:block h-6 w-6 text-slate-600" />

                {/* Microservice & Database */}
                <div class="z-10 flex flex-col space-y-4">
                  <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 w-44 text-center shadow-lg hover:border-blue-500 transition duration-300 relative">
                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600/10 text-blue-400 text-3xs font-bold uppercase px-2 py-0.5 rounded border border-blue-500/20">
                      Microsserviço
                    </div>
                    <Server class="h-6 w-6 mx-auto mb-2 text-blue-400" />
                    <span class="font-bold text-xs block text-slate-200">user-service</span>
                    <span class="text-3xs text-slate-400 block mt-1">Porta: 8080</span>
                  </div>

                  <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 w-44 text-center shadow flex items-center justify-center space-x-2">
                    <Database class="h-4 w-4 text-emerald-400" />
                    <span class="text-xs font-semibold text-slate-300">PostgreSQL 16</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-slate-900/40 rounded-lg p-4 border border-slate-850">
                  <h4 class="text-sm font-semibold text-slate-300 mb-2">Fluxo de Requisições</h4>
                  <ul class="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>O cliente envia requisições exclusivamente para a porta <code class="text-blue-400">8060</code> (API Gateway).</li>
                    <li>O Gateway redireciona dinamicamente a requisição para o <code class="text-blue-400">user-service</code> baseado nas rotas resolvidas pelo Eureka.</li>
                    <li>O token JWT gerado pelo <code class="text-blue-400">user-service</code> é validado de forma independente pelas chamadas subsequentes.</li>
                  </ul>
                </div>
                <div class="bg-slate-900/40 rounded-lg p-4 border border-slate-850">
                  <h4 class="text-sm font-semibold text-slate-300 mb-2">Descoberta em Produção</h4>
                  <p class="text-xs text-slate-400 leading-relaxed">
                    O <code class="text-indigo-400">eureka-server</code> rastreia as instâncias ativas de cada serviço e fornece ao Gateway para o balanceamento de carga inteligente em ambiente distribuído.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TESTS */}
          {activeTab === 'tests' && (
            <div class="space-y-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-bold text-slate-200">Solução e Correção dos Testes de Integração</h2>
                  <p class="text-xs text-slate-400">Entenda os ajustes que tornaram a suíte de testes 100% autônoma e reproduzível.</p>
                </div>
                <button 
                  onClick={copyTestCommand}
                  class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-2 transition duration-200 shadow-lg shadow-blue-500/10 ml-auto md:ml-0"
                >
                  <Terminal class="h-4 w-4" />
                  <span>{copiedCommand ? 'Copiado!' : 'Copiar Comando de Testes'}</span>
                </button>
              </div>

              {/* Status Section */}
              <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                <h3 class="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <CheckCircle2 class="h-4 w-4 mr-2 text-emerald-400" />
                  Estado da Infraestrutura de Teste
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                    <span class="text-slate-400 block mb-1">Tecnologia</span>
                    <strong class="text-slate-200 block text-sm">Testcontainers</strong>
                  </div>
                  <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                    <span class="text-slate-400 block mb-1">Banco de Dados</span>
                    <strong class="text-slate-200 block text-sm">PostgreSQL 16</strong>
                  </div>
                  <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                    <span class="text-slate-400 block mb-1">Migrations</span>
                    <strong class="text-slate-200 block text-sm">Flyway (Habilitado)</strong>
                  </div>
                  <div class="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                    <span class="text-slate-400 block mb-1">Spring Boot Parent</span>
                    <strong class="text-slate-200 block text-sm">4.1.1 (Spring 7)</strong>
                  </div>
                </div>
              </div>

              {/* Resolution details */}
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-slate-300">Resumo Técnico das Mudanças</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item 1 */}
                  <div class="border border-slate-850 bg-slate-900/20 rounded-xl p-4 flex items-start space-x-3">
                    <div class="p-1.5 bg-blue-500/10 rounded text-blue-400 mt-0.5">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-200">Adição do Spring Boot Flyway Starter (POM)</h4>
                      <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                        No Spring Boot 4, a presença exclusiva da dependência <code class="text-blue-400">flyway-core</code> não ativa as migrações automáticas. Substituímos o core pelo starter oficial <code class="text-blue-400">spring-boot-starter-flyway</code>, registrando o auto-loader do Flyway no Spring Boot 4.
                      </p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div class="border border-slate-850 bg-slate-900/20 rounded-xl p-4 flex items-start space-x-3">
                    <div class="p-1.5 bg-indigo-500/10 rounded text-indigo-400 mt-0.5">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-200">Configuração das Rotas de Migração</h4>
                      <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                        Configuramos a propriedade <code class="text-indigo-400">spring.flyway.locations=classpath:migration</code> em <code class="text-indigo-400">application-test.properties</code>. Isso força o Flyway a encontrar a tabela <code class="text-indigo-400">users</code> e suas dependências criadas no classpath correto dos SQLs do projeto antes de inicializar as validações do Hibernate.
                      </p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div class="border border-slate-850 bg-slate-900/20 rounded-xl p-4 flex items-start space-x-3">
                    <div class="p-1.5 bg-cyan-500/10 rounded text-cyan-400 mt-0.5">
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-200">Garantia do Ciclo de Vida do Testcontainers</h4>
                      <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                        Vinculamos e importamos as anotações do <code class="text-cyan-400">TestcontainersConfiguration</code> em todas as classes de integração (incluindo <code class="text-cyan-400">UserControllerIntegrationTest</code>) para garantir que um container PostgreSQL de testes exclusivo seja instanciado automaticamente.
                      </p>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div class="border border-slate-850 bg-slate-900/20 rounded-xl p-4 flex items-start space-x-3">
                    <div class="p-1.5 bg-emerald-500/10 rounded text-emerald-400 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-slate-200">Ativação do Perfil de Teste</h4>
                      <p class="text-xs text-slate-400 mt-1 leading-relaxed">
                        Configuramos o perfil ativo de testes (<code class="text-emerald-400">"test"</code>) no teste geral de carregamento de contexto. Isso impede a leitura incorreta de variáveis de produção ausentes ou conexões de rede involuntárias com o servidor Eureka de descoberta durante testes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div class="space-y-6">
              <div>
                <h2 class="text-lg font-bold text-slate-200">Especificação de APIs Atendidas pelo user-service</h2>
                <p class="text-xs text-slate-400">Use a lista abaixo para realizar requisições no microsserviço ou na porta do API Gateway.</p>
              </div>

              {/* Endpoint Table */}
              <div class="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-900/80 border-b border-slate-800 text-slate-300 font-bold">
                      <th class="p-4">Método</th>
                      <th class="p-4">Rota do Endpoint</th>
                      <th class="p-4">Descrição</th>
                      <th class="p-4">Requisitos</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-400">
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">POST</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/auth/register</code></td>
                      <td class="p-4">Registra um novo usuário no sistema</td>
                      <td class="p-4 text-slate-500">Nenhum (Público)</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">POST</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/auth/login</code></td>
                      <td class="p-4">Autentica usuário e retorna JWT do tipo Bearer</td>
                      <td class="p-4 text-slate-500">Nenhum (Público)</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">GET</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/users/me</code></td>
                      <td class="p-4">Recupera perfil do usuário autenticado no token</td>
                      <td class="p-4 text-blue-400 font-semibold flex items-center"><Lock class="h-3 w-3 mr-1" /> Token JWT</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">PUT</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/users/me</code></td>
                      <td class="p-4">Atualiza dados pessoais do próprio usuário</td>
                      <td class="p-4 text-blue-400 font-semibold flex items-center"><Lock class="h-3 w-3 mr-1" /> Token JWT</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-400 border border-red-500/20">DELETE</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/users/me</code></td>
                      <td class="p-4">Exclui a própria conta do usuário autenticado</td>
                      <td class="p-4 text-blue-400 font-semibold flex items-center"><Lock class="h-3 w-3 mr-1" /> Token JWT</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">GET</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/users</code></td>
                      <td class="p-4">Lista usuários com suporte à paginação</td>
                      <td class="p-4 text-indigo-400 font-semibold flex items-center"><UserCheck class="h-3 w-3 mr-1" /> Somente ADMIN</td>
                    </tr>
                    <tr class="hover:bg-slate-900/20 transition">
                      <td class="p-4"><span class="px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-400 border border-red-500/20">DELETE</span></td>
                      <td class="p-4"><code class="text-slate-200 font-mono">/api/users/admin/&#123;id&#125;</code></td>
                      <td class="p-4">Força a exclusão de um usuário via ID</td>
                      <td class="p-4 text-indigo-400 font-semibold flex items-center"><UserCheck class="h-3 w-3 mr-1" /> Somente ADMIN</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer class="border-t border-slate-800 bg-slate-900/20 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        &copy; 2026 Finflow Developer Hub. Todos os direitos preservados.
      </footer>
    </div>
  );
}
