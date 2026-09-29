import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User as UserIcon, CheckCircle2, ArrowLeft } from 'lucide-react'
import Logo from '../../components/Logo'
import authService from '../../services/authService'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateName = (val: string) => {
    if (!val.trim()) return 'O nome é obrigatório'
    if (val.trim().length < 2) {
      return 'O nome deve ter no mínimo 2 caracteres'
    }
    return ''
  }

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

  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) return 'A confirmação de senha é obrigatória'
    if (val !== pass) {
      return 'As senhas não coincidem'
    }
    return ''
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (isSubmitted) {
      setNameError(validateName(value))
    }
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
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (isSubmitted) {
      setConfirmPasswordError(validateConfirmPassword(value, password))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setGeneralError('')
    setSuccessMsg('')

    const nErr = validateName(name)
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    const cpErr = validateConfirmPassword(confirmPassword, password)

    setNameError(nErr)
    setEmailError(eErr)
    setPasswordError(pErr)
    setConfirmPasswordError(cpErr)

    if (nErr || eErr || pErr || cpErr) {
      return
    }

    setIsLoading(true)

    try {
      await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      setSuccessMsg('Sua conta foi criada com sucesso! Redirecionando para o login...')
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setIsSubmitted(false)

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.message || err.response?.data?.error || 'Não foi possível conectar ao servidor. Verifique se o sistema está online.'
        setGeneralError(apiError)
      } else {
        setGeneralError('Ocorreu um erro ao realizar o cadastro. Tente novamente.')
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
          to="/login" 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <span>Já tenho conta</span>
          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </header>

      {/* Centered Form Workspace */}
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center select-none">
              <Logo className="w-12 h-12" showText={false} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Criar sua conta
            </h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              Comece a organizar suas finanças hoje mesmo de forma simples e livre.
            </p>
          </div>

          {/* Success Box */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200/60 rounded-xl flex gap-3 text-emerald-950 animate-fade-in" role="alert">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">
                <p className="font-extrabold text-emerald-950">Conta Criada!</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Box */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200/60 rounded-xl flex gap-3 text-red-950 animate-fade-in" role="alert">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">
                <p className="font-extrabold text-red-950">Erro ao cadastrar</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4.5" onSubmit={handleSubmit} noValidate>
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nome completo
                </label>
                {nameError && (
                  <span className="text-[11px] font-semibold text-red-600 animate-fade-in">
                    {nameError}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  placeholder="Seu nome completo"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${
                    nameError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 focus:bg-white font-semibold text-slate-700'
                  }`}
                  aria-invalid={nameError ? 'true' : 'false'}
                />
              </div>
            </div>

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
                  placeholder="Seu melhor e-mail"
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
                {passwordError && (
                  <span className="text-[11px] font-semibold text-red-600 animate-fade-in">
                    {passwordError}
                  </span>
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
                  placeholder="No mínimo 6 caracteres"
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

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirmar senha
                </label>
                {confirmPasswordError && (
                  <span className="text-[11px] font-semibold text-red-600 animate-fade-in">
                    {confirmPasswordError}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={isLoading}
                  placeholder="Digite sua senha novamente"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl outline-none transition-all duration-200 ${
                    confirmPasswordError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100/50 focus:bg-white font-semibold text-slate-700'
                  }`}
                  aria-invalid={confirmPasswordError ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Esconder confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 select-none shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Criar minha conta</span>
              )}
            </button>

          </form>

          {/* Already have account link */}
          <div className="pt-6 border-t border-slate-100 mt-6 text-center select-none animate-fade-in">
            <p className="text-xs text-slate-500 font-medium">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors ml-0.5"
              >
                Acessar conta
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
