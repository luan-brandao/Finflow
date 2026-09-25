import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, CheckCircle2 } from 'lucide-react'
import Logo from '../../components/Logo'
import authService from '../../services/authService'
import axios from 'axios'

export default function RegisterPage() {
  const navigate = useNavigate()

  // Field states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Interactive UX states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Validation / Error / Success states
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Validation functions
  const validateName = (val: string) => {
    if (!val.trim()) return 'O nome é obrigatório'
    if (val.trim().length < 2) return 'O nome deve ter no mínimo 2 caracteres'
    return ''
  }

  const validateEmail = (val: string) => {
    if (!val) return 'O e-mail é obrigatório'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val)) return 'Insira um e-mail válido'
    return ''
  }

  const validatePassword = (val: string) => {
    if (!val) return 'A senha é obrigatória'
    if (val.length < 6) return 'A senha deve ter no mínimo 6 caracteres'
    return ''
  }

  const validateConfirmPassword = (val: string, pass: string) => {
    if (!val) return 'A confirmação de senha é obrigatória'
    if (val !== pass) return 'As senhas não coincidem'
    return ''
  }

  // Handle live inputs on change after first submission
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

  // Handle Form Submit
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
      await authService.register({ name, email, password })
      
      setSuccessMsg('Sua conta foi criada com sucesso! Redirecionando para o login...')
      
      // Clear inputs
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
        <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          Já tenho conta
        </Link>
      </header>

      {/* Centered Form Workspace */}
      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white border border-slate-200/70 rounded-2xl p-8 shadow-sm">
          
          {/* Logo & Info */}
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center">
              <Logo className="w-12 h-12" showText={false} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Criar sua conta
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto text-balance">
              Comece a organizar suas finanças hoje mesmo de forma simples e livre.
            </p>
          </div>

          {/* Success Box */}
          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex gap-3 text-emerald-900 animate-fade-in" role="alert">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">
                <p className="font-semibold">Conta Criada!</p>
                <p className="text-emerald-700 mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Box */}
          {generalError && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200/60 rounded-xl flex gap-3 text-red-900 animate-fade-in" role="alert">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">
                <p className="font-semibold">Erro ao cadastrar</p>
                <p className="text-red-700 mt-0.5">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Nome completo</span>
                {nameError && <span className="text-[11px] font-medium text-red-600">{nameError}</span>}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  placeholder="Seu nome completo"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all duration-200 ${
                    nameError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white'
                  }`}
                  aria-invalid={nameError ? 'true' : 'false'}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>E-mail</span>
                {emailError && <span className="text-[11px] font-medium text-red-600">{emailError}</span>}
              </label>
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
                  className={`w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all duration-200 ${
                    emailError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white'
                  }`}
                  aria-invalid={emailError ? 'true' : 'false'}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Senha</span>
                {passwordError && <span className="text-[11px] font-medium text-red-600">{passwordError}</span>}
              </label>
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
                  className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all duration-200 ${
                    passwordError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white'
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 flex justify-between items-center">
                <span>Confirmar senha</span>
                {confirmPasswordError && <span className="text-[11px] font-medium text-red-600">{confirmPasswordError}</span>}
              </label>
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
                  placeholder="Confirme sua nova senha"
                  className={`w-full text-sm pl-10 pr-10 py-2.5 bg-slate-50 border rounded-lg outline-none transition-all duration-200 ${
                    confirmPasswordError 
                      ? 'border-red-300 bg-red-50/10 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white'
                  }`}
                  aria-invalid={confirmPasswordError ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? 'Esconder confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full relative py-2.5 px-4 text-sm font-semibold rounded-lg text-white shadow-sm transition-all duration-200 flex items-center justify-center gap-2 pt-2.5 mt-2 ${
                isLoading 
                  ? 'bg-indigo-600/80 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/10 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          {/* Already have account link */}
          <div className="pt-6 border-t border-slate-100 mt-6 text-center">
            <p className="text-xs text-slate-500">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
              >
                Acessar conta
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400 font-medium">
        <span>&copy; {new Date().getFullYear()} Finflow. Sistema de controle financeiro pessoal.</span>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:text-slate-600 transition-colors">Privacidade</a>
          <a href="#terms" className="hover:text-slate-600 transition-colors">Termos</a>
        </div>
      </footer>
    </div>
  )
}
