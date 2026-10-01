import { useEffect, useState } from 'react'
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Check, 
  ShieldAlert,
  Calendar,
  Eye,
  EyeOff,
  Edit2,
  Shield,
  Coins,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Layout from '../../components/Layout'
import userService from '../../services/userService'
import monthlyIncomeService from '../../services/monthlyIncomeService'
import type { User } from '../../types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editing States
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingIncome, setIsEditingIncome] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  
  // Monthly Income State (Fully Integrated with backend)
  const [incomeAmount, setIncomeAmount] = useState('4500.00')
  const [incomeYear, setIncomeYear] = useState(new Date().getFullYear())
  const [incomeMonth, setIncomeMonth] = useState(new Date().getMonth() + 1)
  const [isSavingIncome, setIsSavingIncome] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await userService.getMe()
      setProfile(data)
      setName(data.name)
      setEmail(data.email)
      
      try {
        const income = await monthlyIncomeService.findCurrentMonthIncome()
        setIncomeAmount(income.amount.toString())
        setIncomeYear(income.year)
        setIncomeMonth(income.month)
      } catch {
        console.log('Nenhuma renda mensal cadastrada para o mês atual no backend, utilizando padrões locais.')
        setIncomeAmount('4500.00')
        setIncomeYear(new Date().getFullYear())
        setIncomeMonth(new Date().getMonth() + 1)
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao obter os dados do perfil.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(incomeAmount)
    if (isNaN(val) || val < 0) {
      setError('Por favor, insira um valor válido de renda de referência.')
      return
    }
    setError('')
    setSuccess('')
    setIsSavingIncome(true)
    try {
      await monthlyIncomeService.createOrUpdate({
        year: incomeYear,
        month: incomeMonth,
        amount: val
      })
      setSuccess('Sua renda de referência mensal foi atualizada com sucesso!')
      setIsEditingIncome(false)
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar a renda de referência.')
    } finally {
      setIsSavingIncome(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('O nome e o e-mail são obrigatórios.')
      return
    }

    if (!password.trim()) {
      setError('Por motivos de segurança, sua senha atual (ou uma nova senha) é obrigatória para autorizar alterações.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve conter no mínimo 8 caracteres para atualizar com segurança.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const updated = await userService.updateMe({
        name: name.trim(),
        email: email.trim(),
        password: password
      })
      setProfile(updated)
      setPassword('')
      setSuccess('As informações do seu perfil foram salvas com sucesso!')
      setIsEditingInfo(false)
      
      setName(updated.name)
      setEmail(updated.email)

      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar alterações no perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  const getMonthName = (monthNum: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[monthNum - 1] || `${monthNum}`
  }

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-2xl mx-auto">
        
        {/* Title / Header section */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Minha Conta</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">Gerencie suas informações cadastrais, renda de referência e credenciais de segurança.</p>
        </div>

        {/* Dynamic global notification banners */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100/85 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/85 dark:border-emerald-900/30 rounded-xl flex items-start gap-3 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{success}</span>
          </div>
        )}

        {loading && !profile ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-medium">Carregando painel de perfil...</p>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            
            {/* 1. Profile Elegant Header Presentation */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl uppercase select-none shrink-0 border border-indigo-100/50 dark:border-indigo-900/20">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 text-center sm:text-left flex-1 space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  {profile.role === 'ADMIN' ? 'Administrador da Plataforma' : 'Membro Padrão'}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">{profile.name}</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium truncate">{profile.email}</p>
                
                {/* Account abstract metadata info */}
                {profile.created && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase pt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
                    <span>Conta criada em: {new Date(profile.created).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Informações Pessoais Section */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Informações Pessoais</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Seus dados de identificação e contato na plataforma.</p>
                </div>
                {!isEditingInfo && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingInfo(true)
                      setName(profile.name)
                      setEmail(profile.email)
                      setPassword('')
                    }}
                    className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              {!isEditingInfo ? (
                /* Information Summary Display */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nome Completo</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Endereço de E-mail</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile.email}</p>
                  </div>
                </div>
              ) : (
                /* Editable form */
                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Nome Completo</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        maxLength={70}
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Endereço de E-mail</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  {/* Visual separation of validation/security field */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-start gap-2.5">
                      <Shield className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Autorizar Alterações</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                          Por motivos de segurança, você deve preencher sua senha atual de acesso para autenticar as alterações cadastrais.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Confirme sua Senha</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          maxLength={100}
                          placeholder="Digite sua senha atual ou uma nova"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Confirmar Alterações</span>
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* 3. Segurança da Conta (Confirmar Senha / Alterar Senha) */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-red-500 shrink-0" />
                  <span>Segurança e Credenciais</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Altere sua credencial de segurança para garantir a integridade da sua conta. Para alterar a senha, utilize o botão de edição na seção de Informações Pessoais acima.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400">
                <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>As regras do Finflow exigem criptografia ponta a ponta robusta.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">As senhas são protegidas no banco usando o algoritmo robusto BCryptPasswordEncoder.</p>
                </div>
              </div>
            </div>

            {/* 4. Planejamento e Renda de Referência Section */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Orçamento e Planejamento</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    A renda cadastrada é utilizada para projetar os valores disponíveis no seu painel.
                  </p>
                </div>
                {!isEditingIncome && (
                  <button
                    type="button"
                    onClick={() => setIsEditingIncome(true)}
                    className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Configurar</span>
                  </button>
                )}
              </div>

              {!isEditingIncome ? (
                /* Income Summary Cards */
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Renda Mensal Vigente</span>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        Referência para {getMonthName(incomeMonth)} de {incomeYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center sm:text-right shrink-0">
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                      {formatCurrency(parseFloat(incomeAmount) || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Editable form for monthly income */
                <form onSubmit={handleSaveIncome} className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Year selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Ano de Referência</label>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        required
                        value={incomeYear}
                        onChange={(e) => setIncomeYear(parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200 font-mono"
                      />
                    </div>

                    {/* Month selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Mês de Referência</label>
                      <select
                        value={incomeMonth}
                        onChange={(e) => setIncomeMonth(parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="1">Janeiro</option>
                        <option value="2">Fevereiro</option>
                        <option value="3">Março</option>
                        <option value="4">Abril</option>
                        <option value="5">Maio</option>
                        <option value="6">Junho</option>
                        <option value="7">Julho</option>
                        <option value="8">Agosto</option>
                        <option value="9">Setembro</option>
                        <option value="10">Outubro</option>
                        <option value="11">Novembro</option>
                        <option value="12">Dezembro</option>
                      </select>
                    </div>

                    {/* Income amount */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Valor de Renda (R$)</label>
                      <div className="relative">
                        <span className="text-sm font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="Ex: 4500.00"
                          value={incomeAmount}
                          onChange={(e) => setIncomeAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditingIncome(false)}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingIncome}
                      className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSavingIncome && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Salvar Renda</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </Layout>
  )
}
