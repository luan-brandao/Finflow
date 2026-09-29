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
  Calendar
} from 'lucide-react'
import Layout from '../../components/Layout'
import transactionService from '../../services/transactionService'
import categoryService from '../../services/categoryService'
import type { Transaction, Category, TransactionType } from '../../types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal / Form state for Create or Edit
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form Fields
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Filter state
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [txs, cats] = await Promise.all([
        transactionService.findAll(),
        categoryService.findAll()
      ])
      setTransactions(txs)
      setCategories(cats)
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id)
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar dados. Verifique a conexão com o servidor.')
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

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const payload = {
      description: description.trim(),
      amount: numericAmount,
      type,
      categoryId,
      date
    }

    try {
      if (editingId) {
        await transactionService.update(editingId, payload)
        setSuccess('Lançamento atualizado com sucesso!')
      } else {
        await transactionService.create(payload)
        setSuccess('Lançamento adicionado com sucesso!')
      }
      setIsFormOpen(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar transação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await transactionService.delete(id)
      setSuccess('Lançamento excluído com sucesso!')
      fetchData()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao excluir transação.')
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Sem Categoria'
  }

  // Filter logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesType = filterType === 'ALL' || tx.type === filterType
    const matchesCategory = filterCategory === 'ALL' || tx.categoryId === filterCategory
    return matchesType && matchesCategory
  })

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transações</h1>
            <p className="text-sm text-slate-500 mt-1">Veja, crie, edite ou remova lançamentos financeiros reais.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            disabled={categories.length === 0}
            className="self-start px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>

        {/* System Warnings */}
        {categories.length === 0 && !loading && (
          <div className="p-4 bg-amber-50 border border-amber-100/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-amber-700">
              Você precisa cadastrar pelo menos uma Categoria antes de poder realizar lançamentos financeiros.
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100/80 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-emerald-700">{success}</span>
          </div>
        )}

        {/* Interactive Filters Grid */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            
            {/* Filter by Type */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full sm:w-auto text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg px-3 py-2 outline-none transition-all cursor-pointer"
              >
                <option value="ALL">Todos os Tipos</option>
                <option value="INCOME">Receitas (+)</option>
                <option value="EXPENSE">Despesas (-)</option>
              </select>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg px-3 py-2 outline-none transition-all cursor-pointer"
              >
                <option value="ALL">Todas as Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="text-xs font-semibold text-slate-400 font-mono">
            {filteredTransactions.length} lançamentos encontrados
          </div>
        </div>

        {/* Create/Edit Form Popover or Card */}
        {isFormOpen && (
          <div className="bg-slate-50 border border-indigo-100 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              
              {/* Type Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tipo</label>
                <div className="flex p-1 bg-slate-200/60 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('EXPENSE')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('INCOME')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Receita
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrição</label>
                <input
                  type="text"
                  maxLength={150}
                  required
                  placeholder="Ex: Aluguel, Uber, Jantar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg outline-none transition-all"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg outline-none transition-all font-mono"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Categoria</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg outline-none transition-all cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-lg outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Lançamento</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Transactions list layout */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          
          {loading && transactions.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Buscando lançamentos...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <ArrowLeftRight className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold">Nenhum lançamento encontrado.</p>
              <p className="text-xs max-w-sm mt-1">Cadastre transações usando o botão acima para controlar seu orçamento diário.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME'
                return (
                  <div key={tx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">{tx.description}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1 font-medium">
                          <span>{getCategoryName(tx.categoryId)}</span>
                          <span className="text-slate-300">·</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{tx.date}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 ml-14 sm:ml-0 shrink-0">
                      
                      {/* Amount */}
                      <span className={`text-base sm:text-lg font-bold font-mono tabular-nums text-right ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>

                      {/* Edit / Delete actions */}
                      <div className="flex items-center gap-1.5 border-l border-slate-100 pl-4">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar Lançamento"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Lançamento"
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

      </div>
    </Layout>
  )
}
