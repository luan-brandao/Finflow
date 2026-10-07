import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { ArrowLeft, BookOpen, Cpu, Shield } from 'lucide-react'

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
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full space-y-12">
        <div className="space-y-4 text-center md:text-left">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para o início</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Sobre o Finflow
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-3xl leading-relaxed text-balance">
            O Finflow é uma plataforma de controle financeiro pessoal projetada para remover a fricção do gerenciamento de dinheiro. Combinando simplicidade visual com recursos poderosos de controle, ele foi desenvolvido para demonstrar práticas modernas de engenharia de software e design de interfaces.
          </p>
        </div>

        {/* Core pillars of the project */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Objetivo do Projeto</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Desenvolvido exclusivamente como um projeto de portfólio profissional para demonstrar a criação de interfaces ricas, limpas e responsivas em um ecossistema web moderno.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Tecnologias Utilizadas</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Construído com React, TypeScript e Tailwind CSS, além de ícones minimalistas fornecidos pela biblioteca Lucide-React.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Design & Experiência</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Foco em eliminar o excesso de informações, priorizando tipografia limpa, paleta de cores balanceada, espaçamentos consistentes e navegação fluida.
            </p>
          </div>
        </div>

        {/* Details & Author */}
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Privacidade & Transparência</h2>
            <p className="text-slate-500 text-xs leading-relaxed">
              Como um projeto demonstrativo, a privacidade e segurança são pilares fundamentais. Nenhuma informação pessoal ou credencial de banco de dados real é solicitada. Toda a experiência simula um ambiente SaaS completo de forma segura.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm select-none">LB</div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Luan Brandão</p>
                <p className="text-[10px] text-slate-400">Desenvolvedor do Projeto</p>
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
              <span>Ver GitHub do Autor</span>
            </a>
          </div>
        </div>
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
