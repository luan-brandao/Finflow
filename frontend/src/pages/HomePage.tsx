import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import Logo from '../components/Logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F9F9FB] text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Contract (Exactly 3 zones: Brand - Nav Links - Primary Actions) */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        {/* Zone 1: Brand Wordmark & Emblem */}
        <div className="flex items-center">
          <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
        </div>

        {/* Zone 2: unboxed nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link to="/sobre" className="hover:text-indigo-600 transition-colors whitespace-nowrap">Sobre o Projeto</Link>
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
        <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-semibold text-indigo-700 animate-fade-in select-none">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Controle financeiro pessoal inteligente</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 text-balance leading-tight max-w-3xl mx-auto">
            Visão clara do seu dinheiro, sem complexidade.
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-balance">
            Um espaço calmo e minimalista para organizar seus gastos diários, acompanhar receitas e atingir suas metas de poupança com simplicidade e clareza.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm shadow-md shadow-slate-900/5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Começar gratuitamente</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-sm"
            >
              Acessar minha conta
            </Link>
          </div>
        </section>

        {/* Real Product UI Mockup (Premium flat design dashboard) */}
        <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-8 shadow-md relative overflow-hidden">
            
            {/* Window controls */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div className="flex gap-1.5 select-none">
                <span className="w-3 h-3 rounded-full bg-slate-100" />
                <span className="w-3 h-3 rounded-full bg-slate-100" />
                <span className="w-3 h-3 rounded-full bg-slate-100" />
              </div>
              <span className="text-xs font-mono text-slate-400 font-medium">finflow.com</span>
              <span className="text-xs font-medium text-slate-400">Meu Painel</span>
            </div>

            {/* Simulated Clean Personal Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Stat 1 */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Saldo Disponível</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-950">R$ 5.420,50</span>
                  <span className="text-xs font-semibold text-emerald-600 font-mono tracking-tight">+R$ 1.250,00</span>
                </div>
              </div>
              
              {/* Stat 2 */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Despesas do Mês</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">R$ 1.840,12</span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">Meta: R$ 2.500</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs text-slate-400 font-medium font-mono">Metas de Poupança</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">R$ 12.350,00</span>
                  <span className="text-xs font-semibold text-indigo-600 font-mono">+12% este mês</span>
                </div>
              </div>
            </div>

            {/* Ledger & Transactions preview */}
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Transações Recentes</span>
                <span className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">Ver extrato completo</span>
              </div>
              <div className="divide-y divide-slate-100">
                {/* Transaction 1 */}
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
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
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs select-none">M</div>
                    <div>
                      <p className="font-semibold text-slate-800">Supermercado Hortifruti</p>
                      <p className="text-xs text-slate-400">Alimentação · Ontem</p>
                    </div>
                  </div>
                  <span className="font-semibold text-rose-600 font-mono tabular-nums">- R$ 142,30</span>
                </div>

                {/* Transaction 3 */}
                <div className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">G</div>
                    <div>
                      <p className="font-semibold text-slate-800">Assinatura Streaming</p>
                      <p className="text-xs text-slate-400">Lazer · 23 Set</p>
                    </div>
                  </div>
                  <span className="font-semibold text-rose-600 font-mono tabular-nums">- R$ 34,90</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center sm:text-left">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo className="w-6 h-6" showText={true} textSize="text-sm" />
          <div className="flex gap-6 text-xs font-mono text-slate-400">
            <span>&copy; {new Date().getFullYear()} Finflow.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
