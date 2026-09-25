import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Sparkles, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Contract (Exactly 3 zones: Brand - Nav Links - Primary Actions) */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark & Emblem */}
        <div className="flex items-center">
          <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
        </div>

        {/* Zone 2: unboxed nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <a href="#recursos" className="hover:text-slate-900 transition-colors whitespace-nowrap">Recursos</a>
          <a href="#sobre" className="hover:text-slate-900 transition-colors whitespace-nowrap">Sobre o Projeto</a>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        
        {/* Hero Section */}
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-semibold text-indigo-700 animate-fade-in select-none">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Controle financeiro pessoal redesenhado</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 text-balance leading-tight max-w-3xl mx-auto">
            Suas finanças pessoais, simplificadas e sob controle.
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
            Um espaço calmo e minimalista para organizar seus gastos diários, acompanhar receitas e atingir seus objetivos de poupança, sem planilhas complexas ou termos corporativos difíceis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm shadow-md shadow-slate-900/5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Começar gratuitamente</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-all duration-200"
            >
              Acessar minha conta
            </Link>
          </div>
        </section>

        {/* Real Product UI Mockup (Anti-AI generic dashboard design: highly functional, flat, clear metrics) */}
        <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-8 shadow-sm relative overflow-hidden">
            
            {/* Window controls */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 mb-6">
              <div className="flex gap-1.5 select-none">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">demo.finflow.com</span>
              <span className="text-xs font-medium text-slate-400">Meu Finflow</span>
            </div>

            {/* Simulated Clean Personal Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Stat 1 */}
              <div className="p-5 bg-white border border-slate-200/60 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Saldo Disponível</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900">R$ 5.420,50</span>
                  <span className="text-xs font-semibold text-emerald-600 font-mono tracking-tight">+R$ 1.250,00</span>
                </div>
              </div>
              
              {/* Stat 2 */}
              <div className="p-5 bg-white border border-slate-200/60 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Despesas do Mês</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-red-600">R$ 1.840,12</span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">Meta: R$ 2.500</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-5 bg-white border border-slate-200/60 rounded-xl">
                <span className="text-xs text-slate-400 font-medium font-mono">Guardado na Poupança</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-indigo-600">R$ 12.350,00</span>
                  <span className="text-xs font-semibold text-indigo-600 font-mono">+12% este mês</span>
                </div>
              </div>
            </div>

            {/* Ledger & Transactions preview */}
            <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Transações Recentes</span>
                <span className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">Ver extrato completo</span>
              </div>
              <div className="divide-y divide-slate-100">
                {/* Transaction 1 */}
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs select-none">R</div>
                    <div>
                      <p className="font-semibold text-slate-800">Transferência Recebida</p>
                      <p className="text-xs text-slate-400">Salário mensal · Hoje</p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-600 font-mono tabular-nums">+ R$ 5.200,00</span>
                </div>

                {/* Transaction 2 */}
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs select-none">M</div>
                    <div>
                      <p className="font-semibold text-slate-800">Supermercado Hortifruti</p>
                      <p className="text-xs text-slate-400">Alimentação · Ontem</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600 font-mono tabular-nums">- R$ 142,30</span>
                </div>

                {/* Transaction 3 */}
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">G</div>
                    <div>
                      <p className="font-semibold text-slate-800">Assinatura Streaming</p>
                      <p className="text-xs text-slate-400">Lazer · 23 Set</p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600 font-mono tabular-nums">- R$ 34,90</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Sections: Recursos */}
        <section id="recursos" className="border-t border-slate-100 bg-slate-50/50 py-16 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Acompanhamento Intuitivo</h3>
              <p className="text-slate-500 text-sm leading-relaxed text-balance">
                Cadastre suas receitas e despesas com poucos toques. Categorize automaticamente para entender para onde vai seu dinheiro todos os meses.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Privacidade em Primeiro Lugar</h3>
              <p className="text-slate-500 text-sm leading-relaxed text-balance">
                Seus dados financeiros são exclusivamente seus. Criptografia ponta a ponta e total transparência, sem vender ou compartilhar suas informações.
              </p>
            </div>
          </div>
        </section>

        {/* Sobre o Projeto Section */}
        <section id="sobre" className="border-t border-slate-100 bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-balance">Sobre o Projeto</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-balance">
              Este é um projeto pessoal de controle financeiro desenvolvido exclusivamente para fins de portfólio. Ele demonstra a criação de uma interface limpa, moderna e altamente interativa em React, TypeScript e Tailwind CSS, projetada cuidadosamente para oferecer uma experiência de usuário simples e elegante.
            </p>
            <div className="pt-4">
              <a 
                href="https://github.com/luan-brandao" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium rounded-lg text-sm transition-all duration-200"
              >
                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>Ver GitHub do Autor</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center sm:text-left">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo className="w-6 h-6" showText={true} textSize="text-sm" />
          <div className="flex gap-6 text-xs font-mono text-slate-400">
            <a href="#privacidade" className="hover:text-slate-600 transition-colors">Privacidade</a>
            <a href="#termos" className="hover:text-slate-600 transition-colors">Termos de Uso</a>
            <span>&copy; {new Date().getFullYear()} Finflow.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
