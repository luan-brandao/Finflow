import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowLeft, GitBranch, Server, Shield, Layers, MessageSquare, Database } from 'lucide-react'

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] text-slate-900 flex flex-col font-sans">
      {/* Navbar (Same exact premium layout as Home) */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Início</Link>
          <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600 py-1">Sobre o Projeto</span>
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
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm hover:shadow-indigo-500/10 transition-all duration-200 whitespace-nowrap"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full space-y-16">
        {/* Header Block */}
        <div className="space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para o início</span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Arquitetura do Finflow
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-3xl">
            O Finflow é uma aplicação robusta baseada em uma arquitetura de microsserviços orientada a eventos. Abaixo está detalhado o papel de cada serviço e tecnologia envolvidos na plataforma.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>Visão Geral do Sistema</span>
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Diferente de aplicações monolíticas tradicionais, o Finflow divide suas responsabilidades em pequenos serviços independentes e altamente coesos. Essa escolha garante escalabilidade, facilidade de manutenção e isolamento de falhas ao longo de toda a plataforma.
          </p>
        </section>

        {/* Section 2: Microsserviços */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-indigo-500" />
            <span>Estrutura de Microsserviços (Backend)</span>
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {/* User Service */}
            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-2">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded">USER-SERVICE</span>
              <h3 className="text-base font-bold text-slate-900">Gerenciamento de Usuários e Autenticação</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Responsável pelo fluxo de criação de contas, login, controle de perfis de acesso (Roles) e gerenciamento de onboarding de novos usuários na plataforma.
              </p>
            </div>

            {/* Finance Service */}
            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-2">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded">FINANCE-SERVICE</span>
              <h3 className="text-base font-bold text-slate-900">Core Financeiro e Lançamentos</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Gerencia o núcleo financeiro da plataforma: transações de receitas e despesas, controle e faturas de cartões de crédito, definição de orçamentos por categoria, e acompanhamento em tempo real das metas de poupança configuradas pelo usuário.
              </p>
            </div>

            {/* Notification Service */}
            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-2">
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded">NOTIFICATION-SERVICE</span>
              <h3 className="text-base font-bold text-slate-900">Notificações e Preferências do Usuário</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Escuta de forma assíncrona os eventos do sistema e decide, com base nas preferências configuradas individualmente pelo usuário, quais alertas disparar (como alertas de orçamento ultrapassado ou conquistas de metas).
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Infraestrutura */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-indigo-500" />
            <span>Infraestrutura e Comunicação</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>API Gateway & Segurança</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Atua como o único ponto de entrada para o cliente. É responsável por centralizar o roteamento de requisições externas para seus respectivos microsserviços e validar tokens JWT, protegendo as rotas de forma stateless.
              </p>
            </div>

            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Service Discovery (Eureka)</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Registra de maneira dinâmica todos os microsserviços ativos. Permite que as instâncias encontrem umas às outras na rede interna sem a necessidade de IPs fixos ou configurações rígidas.
              </p>
            </div>

            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Eventos Assíncronos (RabbitMQ)</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Utilizado para o desacoplamento de serviços. Quando um orçamento estoura ou uma meta é atingida, o `finance-service` publica um evento na exchange, que é de forma imediata e assíncrona consumido pelo `notification-service`.
              </p>
            </div>

            <div className="bg-white border border-slate-200/50 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                <span>Persistência Relacional (PostgreSQL)</span>
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Cada microsserviço gerencia sua própria base de dados relacional de forma isolada, garantindo a autonomia dos serviços, consistência transacional forte (ACID) e isolamento completo das tabelas de dados.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Author Link */}
        <section className="bg-white border border-slate-200/50 p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm select-none">LB</div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Luan Brandão</p>
              <p className="text-[10px] text-slate-400">Desenvolvedor do Finflow</p>
            </div>
          </div>

          <a 
            href="https://github.com/luan-brandao" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium rounded-lg text-xs transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            <span>Acessar GitHub</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center sm:text-left">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo className="w-6 h-6" showText={true} textSize="text-sm" />
          <div className="flex gap-6 text-xs font-mono text-slate-400">
            <span>&copy; {new Date().getFullYear()} Finflow.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
