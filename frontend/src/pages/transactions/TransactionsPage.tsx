import { useEffect, useState } from 'react'
import { 
  ArrowLeftRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  CreditCard,
  Target
} from 'lucide-react'
import Layout from '../../components/Layout'
import transactionService from '../../services/transactionService'
import categoryService from '../../services/categoryService'
import cardService from '../../services/cardService'
import goalService from '../../services/goalService'
import ConfirmModal from '../../components/ConfirmModal'
import type { Transaction, Category, TransactionType, Card, Goal } from '../../types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Credit Cards and Goals integration states
  const [localCards, setLocalCards] = useState<Card[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  // Confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')

  // Modal / Form state for Create or Edit
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form Fields
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [cardId, setCardId] = useState('') // card select
  const [goalId, setGoalId] = useState('') // goal select
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Filter state
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [filterCard, setFilterCard] = useState('ALL') // card filter
  const [filterGoal, setFilterGoal] = useState('ALL') // goal filter

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [txs, cats, cardsData, goalsData] = await Promise.all([
        transactionService.findAll(),
        categoryService.findAll(),
        cardService.findAll(),
        goalService.findAll()
      ])
      
      setTransactions(txs)
      setCategories(cats)
      setLocalCards(cardsData)
      setGoals(goalsData)

      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id)
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar os lançamentos. Verifique se o backend está online.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setDescription('')
    setAmount('')
    setType('EXPENSE')
    if (categories.length > 0) {
      setCategoryId(categories[0].id)
    }
    setCardId('')
    setGoalId('')
    setDate(new Date().toISOString().split('T')[0])
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleOpenEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setDescription(tx.description)
    setAmount(tx.amount.toString())
    setType(tx.type)
    setCategoryId(tx.categoryId)
    setCardId(tx.cardId || '')
    setGoalId(tx.goalId || '')
    setDate(tx.date)
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount || !categoryId || !date) {
      setError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('O valor do lançamento deve ser maior que zero.')
      return
    }

    if (type === 'EXPENSE' && cardId) {
      const selectedCard = localCards.find(c => c.id === cardId)
      if (selectedCard) {
        let currentUsed = selectedCard.used
        const originalTx = transactions.find(t => t.id === editingId)
        if (originalTx && originalTx.cardId === cardId && originalTx.type === 'EXPENSE') {
          currentUsed = Math.max(0, currentUsed - originalTx.amount)
        }
        const availableLimit = selectedCard.limit - currentUsed
        if (numericAmount > availableLimit) {
          setError(`Esta despesa ultrapassa o limite disponível do cartão. Limite disponível: ${formatCurrency(availableLimit)}`)
          return;
        }
      }
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      description: description.trim(),
      amount: numericAmount,
      type,
      categoryId,
      date,
      cardId: (type === 'EXPENSE' && cardId) ? cardId : undefined,
      goalId: goalId || undefined
    }

    try {
      if (editingId) {
        await transactionService.update(editingId, payload)
        setSuccess('Lançamento atualizado com sucesso!')
      } else {
        await transactionService.create(payload)
        setSuccess('Lançamento registrado com sucesso!')
      }
      setIsFormOpen(false)
      fetchData()
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao salvar o lançamento no backend.')
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

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id)
    return cat ? cat.name : 'Sem Categoria'
  }

  const getCardName = (id?: string) => {
    if (!id) return null
    const card = localCards.find(c => c.id === id)
    return card ? card.name : null
  }

  const getGoalName = (id?: string) => {
    if (!id) return null
    const goal = goals.find(g => g.id === id)
    return goal ? goal.title : null
  }

  // Multi Filter logic: Type + Category + Credit Card + Goal + Instant Description Search
  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'ALL' || tx.type === filterType
    const matchesCategory = filterCategory === 'ALL' || tx.categoryId === filterCategory
    const matchesCard = filterCard === 'ALL' || tx.cardId === filterCard
    const matchesGoal = filterGoal === 'ALL' || tx.goalId === filterGoal
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesCategory && matchesCard && matchesGoal && matchesSearch
  })

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Title and Top actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Transações</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">Veja, registre e acompanhe todos os seus fluxos de caixa reais.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            disabled={categories.length === 0}
            className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 disabled:opacity-50 cursor-pointer animate-fade-in"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Lançamento</span>
          </button>
        </div>

        {/* System Warnings */}
        {categories.length === 0 && !loading && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Você precisa cadastrar pelo menos uma Categoria antes de poder realizar lançamentos financeiros. Vá para a página de Categorias.
            </span>
          </div>
        )}

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

        {/* Filter Toolbar (Segmented Filters & Search) */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm">
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-44 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full sm:w-auto text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl px-2.5 py-2 outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="ALL">Tipos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl px-2.5 py-2 outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="ALL">Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Credit Card */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                value={filterCard}
                onChange={(e) => setFilterCard(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl px-2.5 py-2 outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="ALL">Cartões</option>
                {localCards.map(card => (
                  <option key={card.id} value={card.id}>{card.name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Goal */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl px-2.5 py-2 outline-none transition-all cursor-pointer font-semibold"
              >
                <option value="ALL">Metas</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase select-none shrink-0">
            {filteredTransactions.length} Lançamentos
          </div>
        </div>

        {/* Floating Custom Edit/Create Form Card */}
        {isFormOpen && (
          <div className="bg-slate-50 dark:bg-[#1E293B] border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {editingId ? 'Editar Detalhes do Lançamento' : 'Novo Lançamento Financeiro'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
              
              {/* Type Switch Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tipo de Fluxo</label>
                <div className="flex p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-xl select-none">
                  <button
                    type="button"
                    onClick={() => { setType('EXPENSE'); setCardId(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${type === 'EXPENSE' ? 'bg-white dark:bg-[#1E293B] text-red-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('INCOME'); setCardId(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${type === 'INCOME' ? 'bg-white dark:bg-[#1E293B] text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Descrição</label>
                <input
                  type="text"
                  maxLength={150}
                  required
                  placeholder="Ex: Almoço de negócios"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-250"
                />
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Valor do Lançamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Categoria</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all cursor-pointer font-semibold text-slate-600 dark:text-slate-300"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Credit Card Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Cartão {type === 'INCOME' && <span className="text-[9px] lowercase font-normal italic">(somente despesa)</span>}
                </label>
                <select
                  disabled={type === 'INCOME' || localCards.length === 0}
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all cursor-pointer font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50"
                >
                  <option value="">Nenhum Cartão</option>
                  {localCards.map(card => (
                    <option key={card.id} value={card.id}>{card.name}</option>
                  ))}
                </select>
              </div>

              {/* Goal Association Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Vincular a um Objetivo (Meta)</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all cursor-pointer font-semibold text-slate-600 dark:text-slate-300"
                >
                  <option value="">Nenhum Objetivo</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>

              {type === 'EXPENSE' && cardId && (() => {
                const selectedCard = localCards.find(c => c.id === cardId)
                if (!selectedCard) return null
                let currentUsed = selectedCard.used
                const originalTx = transactions.find(t => t.id === editingId)
                if (originalTx && originalTx.cardId === cardId && originalTx.type === 'EXPENSE') {
                  currentUsed = Math.max(0, currentUsed - originalTx.amount)
                }
                const availableLimit = selectedCard.limit - currentUsed
                const inputVal = parseFloat(amount) || 0
                const isExceeded = inputVal > availableLimit

                return (
                  <div className="sm:col-span-2 lg:col-span-3 p-3.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl space-y-2 mt-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold">Resumo do Cartão {selectedCard.name}:</span>
                      <div className="flex gap-4 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        <span>Limite: {formatCurrency(selectedCard.limit)}</span>
                        <span>Utilizado: {formatCurrency(currentUsed)}</span>
                        <span className={isExceeded ? "text-red-600" : "text-emerald-600 dark:text-emerald-400 font-extrabold"}>
                          Disponível: {formatCurrency(availableLimit)}
                        </span>
                      </div>
                    </div>
                    {isExceeded && (
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 animate-pulse">
                        ⚠️ Esta despesa ultrapassa o limite disponível do cartão.
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* Submit Buttons footer */}
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-3">
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
                  className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Lançamento</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* High-fidelity list of transactions */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          
          {loading && transactions.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1E293B]">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sincronizando extrato financeiro...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1E293B]">
              <ArrowLeftRight className="w-12 h-10 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold">Nenhum lançamento localizado.</p>
              <p className="text-xs max-w-xs leading-relaxed text-slate-400 dark:text-slate-550 font-medium">Use o botão no topo para registrar receitas ou despesas e ter visibilidade do seu orçamento diário.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME'
                const cardName = getCardName(tx.cardId)
                const goalName = getGoalName(tx.goalId)
                return (
                  <div key={tx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/40 transition-colors animate-fade-in">
                    
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      
                      {/* Interactive Visual indicator circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                        {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base truncate">{tx.description}</p>
                        
                        {/* Unboxed inline metadata style with · separator */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                          <span>{getCategoryName(tx.categoryId)}</span>
                          <span aria-hidden="true" className="text-slate-200 dark:text-slate-800">·</span>
                          <div className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{tx.date}</span>
                          </div>
                          {cardName && (
                            <>
                              <span aria-hidden="true" className="text-slate-200 dark:text-slate-800">·</span>
                              <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-bold select-none">
                                <CreditCard className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                                <span>{cardName}</span>
                              </div>
                            </>
                          )}
                          {goalName && (
                            <>
                              <span aria-hidden="true" className="text-slate-200 dark:text-slate-800">·</span>
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold select-none">
                                <Target className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                <span>{goalName}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 ml-14 sm:ml-0 shrink-0 select-none">
                      
                      {/* Monospace tabular numerals */}
                      <span className={`text-base sm:text-lg font-bold font-mono tabular-nums text-right ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>

                      {/* Edit / Delete actions bar */}
                      <div className="flex items-center gap-1 border-l border-slate-100 dark:border-slate-800 pl-4">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 rounded-xl transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/45 rounded-xl transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                )
              })}
            </div>
          )}

        </div>

        <ConfirmModal
          isOpen={!!deleteId}
          title="Excluir Lançamento Financeiro"
          message="Tem certeza de que deseja remover este lançamento? Esta ação é irreversível e o valor será excluído do seu painel e extrato."
          onConfirm={async () => {
            if (deleteId) {
              setError('')
              setSuccess('')
              await transactionService.delete(deleteId)
              setSuccess('Lançamento removido com sucesso!')
              fetchData()
            }
          }}
          onClose={() => setDeleteId(null)}
        />

      </div>
    </Layout>
  )
}
