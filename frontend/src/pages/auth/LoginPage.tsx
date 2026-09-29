import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Logo from '../../components/Logo'
import authService from '../../services/authService'
import axios from 'axios'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateEmail = (val: string) => {
    if (!val) return 'O e-mail é obrigatório'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val)) {
      return 'Insira um e-mail válido'
    }
    return ''
  }

  const validatePassword = (val: string) => {
    if (!val) return 'A senha é obrigatória'
    if (val.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres'
    }
    return ''
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (isSubmitted) {
      setEmailError(validateEmail(value))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (isSubmitted) {
      setPasswordError(validatePassword(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setGeneralError('')

    const eErr = validateEmail(email)
    const pErr = validatePassword(password)

    setEmailError(eErr)
    setPasswordError(pErr)

    if (eErr || pErr) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })
      if (response && response.token) {
        authService.setToken(response.token)
        navigate('/dashboard')
      } else {
        setGeneralError('Não foi possível obter o token de autenticação.')
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.message || err.response?.data?.error || 'Não foi possível conectar ao servidor. Verifique se o sistema está online.'
        setGeneralError(apiError)
      } else {
        setGeneralError('Ocorreu um erro ao realizar o login. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 antialiased font-sans">

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/">
          <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
        </Link>
        <Link 
          to="/" 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao início</span>
        </Link>
      </header>

      {/* Centered Login Workspace Card */}
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center select-none">
              <Logo className="w-12 h-12" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Acesse sua conta
            </h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              Organize suas economias pessoais e gerencie seus gastos diários.
            </p>
          </div>

          {/* General Error Alert */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200/60 rounded-xl flex gap-3 text-red-900 animate-fade-in" role="alert">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">
                <p className="font-extrabold text-red-950">Erro ao autenticar</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  E-mail
                </label>
                {emailError && (
                  <span className="text-[11px] font-semibold text-red-600 animate-fade-in">
                    {emailError}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  placeholder="Seu e-mail cadastrado"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${
                    emailError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 focus:bg-white font-semibold text-slate-700'
                  }`}
                  aria-invalid={emailError ? 'true' : 'false'}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Senha
                </label>
                {passwordError ? (
                  <span className="text-[11px] font-semibold text-red-600 animate-fade-in">
                    {passwordError}
                  </span>
                ) : (
                  <a 
                    href="#forgot" 
                    onClick={(e) => {
                      e.preventDefault()
                      setGeneralError('A recuperação de senha não está ativa neste momento.')
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Esqueceu?
                  </a>
                )}
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  placeholder="Sua senha de acesso"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${
                    passwordError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 focus:bg-white font-semibold text-slate-700'
                  }`}
                  aria-invalid={passwordError ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 select-none shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>

          </form>

          {/* Create Account Link */}
          <div className="pt-6 border-t border-slate-100 mt-6 text-center select-none">
            <p className="text-xs text-slate-500 font-medium">
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors ml-0.5"
              >
                Criar conta
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400 font-mono tracking-wide uppercase select-none">
        <span>&copy; {new Date().getFullYear()} Finflow. Painel pessoal de investimentos.</span>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacidade</a>
          <a href="#terms" className="hover:text-slate-600 transition-colors">Termos</a>
        </div>
      </footer>

    </div>
  )
}
