import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
      <main className="flex-1 flex flex-col justify-center py-20 md:py-32">
        {/* Hero Section */}
        <section className="px-6 max-w-5xl mx-auto w-full text-center space-y-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.1] max-w-4xl mx-auto">
            Organização financeira pessoal sem complicação.
          </h1>
          
          <p className="text-slate-500 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-balance font-normal">
            O Finflow é uma plataforma simplificada de finanças pessoais. Registre seus lançamentos de forma limpa, acompanhe despesas, configure limites de cartões de crédito e controle metas de poupança sob uma perspectiva visual calma e objetiva.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link 
              to="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-semibold rounded-xl text-base shadow-lg shadow-slate-900/10 hover:shadow-indigo-500/5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Começar gratuitamente</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 border border-slate-200 hover:bg-slate-50 text-slate-800 bg-white font-semibold rounded-xl text-base transition-all duration-200 shadow-sm"
            >
              Acessar minha conta
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-10 text-center sm:text-left">
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
