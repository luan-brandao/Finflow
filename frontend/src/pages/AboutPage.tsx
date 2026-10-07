import { Link } from 'react-router-dom'
import { Server, Database, MessageSquare, Shield, Layers, Layout as LayoutIcon, Code, ChevronRight, Github } from 'lucide-react'
import Logo from '../components/Logo'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans">
      
      {/* Navbar (Public Area - Only Home & Sobre o projeto) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link to="/sobre" className="text-indigo-600 font-semibold transition-colors">
            Sobre o Projeto
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            Entrar
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all duration-200 whitespace-nowrap"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        
        {/* Intro / Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-700">
            Arquitetura & Engenharia de Software
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Por dentro do Finflow
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            O Finflow é um projeto de portfólio robusto projetado para simular o ecossistema de uma aplicação financeira de alto nível, com arquitetura distribuída, mensageria e testes automatizados rigorosos.
          </p>
        </section>

        {/* Technical Architecture Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: Backend */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Backend em Microserviços</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Desenvolvido com <strong>Java 21</strong> e <strong>Spring Boot 3</strong>, dividindo responsabilidades entre múltiplos microsserviços autônomos integrados através do <strong>Spring Cloud Gateway</strong> e <strong>Eureka Discovery</strong>.
            </p>
          </div>

          {/* Card 2: Async Messages */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Mensageria Assíncrona</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Comunicação orientada a eventos usando o <strong>RabbitMQ</strong>. Ações financeiras críticas publicam mensagens em exchanges distribuídas, processadas de forma assíncrona pelo serviço de notificações.
            </p>
          </div>

          {/* Card 3: Database & Testing */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Persistência & Migrations</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Bancos de dados <strong>PostgreSQL</strong> independentes para garantir o isolamento. Os schemas de tabelas e as evoluções são versionados e aplicados automaticamente usando o <strong>Flyway</strong>.
            </p>
          </div>
          
        </div>

        {/* In-depth details */}
        <section className="bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            Decisões de Projeto & Implementação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* Sec 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Segurança Descentralizada com JWT</h4>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                A autenticação é centralizada no `user-service`, mas a validação do token JWT e o mapeamento de papéis (`ROLE_ADMIN` e `ROLE_USER`) são realizados de forma descentralizada em cada microsserviço individual através do filtro de segurança do Spring Security, reduzindo a latência.
              </p>
            </div>

            {/* Sec 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Testes de Integração com Testcontainers</h4>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Garantia extrema de qualidade: em vez de usar bancos de dados H2 falsos em memória para testes, o ecossistema utiliza <strong>Testcontainers</strong> para subir instâncias reais do PostgreSQL e do RabbitMQ em Docker para testes de integração reais das APIs de ponta a ponta.
              </p>
            </div>

            {/* Sec 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LayoutIcon className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Interface SPA Moderna & Responsiva</h4>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Construído em <strong>React 19</strong>, <strong>TypeScript</strong> e compilado de forma ultra-rápida via <strong>Vite</strong>. Utiliza <strong>Tailwind CSS</strong> para uma estilização performática e layouts fluidos e responsivos para celular, tablet e desktop.
              </p>
            </div>

            {/* Sec 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Padrão DTO & Mapeamentos Seguros</h4>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                Garante que os dados internos do banco de dados nunca vazem para a API externa. Utiliza os <strong>Records Java</strong> para construir DTOs imutáveis de entrada e saída, convertidos e mapeados de forma performática pelo compilador através do <strong>MapStruct</strong>.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-900">Quer analisar o código-fonte?</p>
              <p className="text-slate-500 text-xs">Acesse o portfólio completo com todos os microsserviços integrados no GitHub.</p>
            </div>
            <a 
              href="https://github.com/luan-brandao" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
              <span>Ver GitHub do Autor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/50 px-6 py-8 text-center sm:text-left">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo className="w-6 h-6" showText={true} textSize="text-sm" />
          <div className="flex gap-6 text-xs font-mono text-slate-400">
            <span className="hover:text-slate-600 transition-colors cursor-default">Privacidade</span>
            <span className="hover:text-slate-600 transition-colors cursor-default">Termos de Uso</span>
            <span>&copy; {new Date().getFullYear()} Finflow.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
