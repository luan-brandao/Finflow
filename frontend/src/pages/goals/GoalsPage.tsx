import { useEffect, useState } from 'react'
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  Coins,
  Calendar,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import Layout from '../../components/Layout'
import goalService from '../../services/goalService'
import ConfirmModal from '../../components/ConfirmModal'
import type { Goal } from '../../types'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal / Form state for Create or Edit
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Fund Modal state
  const [isFundOpen, setIsFundOpen] = useState(false)
  const [fundingGoal, setFundingGoal] = useState<Goal | null>(null)
  const [fundAmount, setFundAmount] = useState('')
  const [isFunding, setIsFunding] = useState(false)

  // Confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('0')
  const [targetDate, setTargetDate] = useState('')

  const fetchGoals = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await goalService.findAll()
      setGoals(data)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar seus objetivos e metas financeiras.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitle('')
    setTargetAmount('')
    setCurrentAmount('0')
    // Default target date: 1 year from now
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    setTargetDate(nextYear.toISOString().split('T')[0])
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleOpenEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setTitle(goal.title)
    setTargetAmount(goal.targetAmount.toString())
    setCurrentAmount(goal.currentAmount.toString())
    setTargetDate(goal.targetDate)
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleOpenFund = (goal: Goal) => {
    setFundingGoal(goal)
    setFundAmount('')
    setIsFundOpen(true)
    setError('')
    setSuccess('')
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleCloseFund = () => {
    setIsFundOpen(false)
    setFundingGoal(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !targetAmount || !targetDate) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const numericTarget = parseFloat(targetAmount)
    const numericCurrent = parseFloat(currentAmount) || 0

    if (isNaN(numericTarget) || numericTarget <= 0) {
      setError('O valor do objetivo deve ser maior que zero.')
      return
    }

    if (numericCurrent < 0) {
      setError('O valor guardado não pode ser negativo.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      title: title.trim(),
      targetAmount: numericTarget,
      currentAmount: numericCurrent,
      targetDate
    }

    try {
      if (editingId) {
        await goalService.update(editingId, payload)
        setSuccess('Meta financeira atualizada com sucesso!')
      } else {
        await goalService.create(payload)
        setSuccess('Nova meta financeira cadastrada com sucesso!')
      }
      setIsFormOpen(false)
      fetchGoals()
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao salvar o objetivo no backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fundingGoal || !fundAmount) return

    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('O valor a guardar deve ser maior que zero.')
      return
    }

    setError('')
    setSuccess('')
    setIsFunding(true)

    try {
      const updatedAmount = fundingGoal.currentAmount + amount
      await goalService.update(fundingGoal.id, {
        title: fundingGoal.title,
        targetAmount: fundingGoal.targetAmount,
        currentAmount: updatedAmount,
        targetDate: fundingGoal.targetDate
      })

      setSuccess(`Adicionado R$ ${amount.toFixed(2)} à meta "${fundingGoal.title}"!`)
      setIsFundOpen(false)
      fetchGoals()

      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao aportar fundos na meta.')
    } finally {
      setIsFunding(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  const calculateMonthsRemaining = (dateStr: string) => {
    const today = new Date()
    const target = new Date(dateStr)
    const yearsDiff = target.getFullYear() - today.getFullYear()
    const monthsDiff = target.getMonth() - today.getMonth()
    const totalMonths = (yearsDiff * 12) + monthsDiff
    return Math.max(1, totalMonths)
  }

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    } catch {
      return dateStr
    }
  }

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Title and Top actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Metas Financeiras</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">Cadastre objetivos, economize dinheiro e acompanhe sua evolução de forma clara.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Objetivo</span>
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100/80 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30 rounded-xl flex items-start gap-3 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{success}</span>
          </div>
        )}

        {/* Form to Add/Edit Goals */}
        {isFormOpen && (
          <div className="bg-slate-50 dark:bg-[#1E293B] border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>{editingId ? 'Editar Detalhes do Objetivo' : 'Criar Novo Objetivo Financeiro'}</span>
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
              
              {/* Title Field */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Título da Meta</label>
                <input
                  type="text"
                  maxLength={150}
                  required
                  placeholder="Ex: Reserva de Emergência, Viagem para o Japão..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Valor Alvo do Objetivo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Current Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Valor Inicial Guardado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={currentAmount}
                  disabled={!!editingId} // No edit directly here to preserve historical funds progression
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200 disabled:opacity-50"
                />
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Data Alvo</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Objetivo</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Goals Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Carregando suas metas financeiras...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <Target className="w-12 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold">Nenhum objetivo cadastrado.</p>
            <p className="text-xs max-w-xs leading-relaxed text-slate-400 dark:text-slate-550 font-medium">Cadastre objetivos financeiros no botão acima e comece a acompanhar seu progresso para a realização de sonhos de forma planejada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((goal) => {
              const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)
              const percentCompleted = goal.targetAmount > 0 
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
                : 0

              const monthsRemaining = calculateMonthsRemaining(goal.targetDate)
              const requiredMonthlySaving = remainingAmount / monthsRemaining

              return (
                <div 
                  key={goal.id} 
                  className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Top Content */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">{goal.title}</h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Meta para: {formatDate(goal.targetDate)} ({monthsRemaining} {monthsRemaining === 1 ? 'mês' : 'meses'} restantes)</span>
                          </p>
                        </div>
                      </div>

                      {/* Small Quick Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Editar meta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(goal.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                          title="Excluir meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Guardado atual</span>
                          <span className="block font-mono font-extrabold text-slate-800 dark:text-slate-200 text-sm">{formatCurrency(goal.currentAmount)}</span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Objetivo</span>
                          <span className="block font-mono font-extrabold text-slate-800 dark:text-slate-200 text-sm">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="relative">
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentCompleted}%` }}
                          />
                        </div>
                        <span className="absolute -top-6 right-0 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/10 px-1.5 py-0.5 rounded-md">
                          {percentCompleted}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calculations and Action area */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {remainingAmount > 0 ? (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
                            <p className="truncate">
                              Faltam <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(remainingAmount)}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
                            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                            <p className="truncate">
                              Economize <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(requiredMonthlySaving)}</span>/mês
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold leading-relaxed">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>Objetivo conquistado com sucesso! 🎉</span>
                        </div>
                      )}
                    </div>

                    {remainingAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenFund(goal)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm hover:border-slate-300"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Aportar Fundos</span>
                      </button>
                    )}

                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* Contribute Modal Form */}
        {isFundOpen && fundingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-6 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Aportar Fundos na Meta</span>
                </h3>
                <button 
                  type="button" 
                  onClick={handleCloseFund}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddFunds} className="space-y-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 rounded-xl text-xs space-y-1 font-semibold text-slate-600 dark:text-slate-400">
                  <p className="text-slate-400 uppercase font-bold text-[9px]">Aportando em:</p>
                  <p className="font-extrabold text-slate-800 dark:text-white text-sm">{fundingGoal.title}</p>
                  <p className="text-[10px] mt-2 opacity-90">Total Alvo: {formatCurrency(fundingGoal.targetAmount)}</p>
                  <p className="text-[10px] opacity-90">Guardado Atual: {formatCurrency(fundingGoal.currentAmount)}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Valor a Economizar/Aportar (R$)</label>
                  <div className="relative">
                    <span className="text-sm font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0,00"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleCloseFund}
                    disabled={isFunding}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isFunding}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    {isFunding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirmar Aporte</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={!!deleteId}
          title="Excluir Objetivo Financeiro"
          message="Tem certeza que deseja excluir esta meta? Seu histórico de economia associado a ela continuará existindo, mas o objetivo de planejamento será removido."
          onConfirm={async () => {
            if (deleteId) {
              setError('')
              setSuccess('')
              await goalService.delete(deleteId)
              setSuccess('Objetivo financeiro excluído com sucesso!')
              fetchGoals()
            }
          }}
          onClose={() => setDeleteId(null)}
        />

      </div>
    </Layout>
  )
}
