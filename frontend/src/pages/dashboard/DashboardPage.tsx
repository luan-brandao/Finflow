import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ListCollapse, 
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderMinus,
  Receipt
} from 'lucide-react'
import Layout from '../../components/Layout'
import dashboardService from '../../services/dashboardService'
import type { DashboardResponse } from '../../types'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchDashboardData = async (start?: string, end?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await dashboardService.getDashboard(start, end)
      setDashboard(data)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erro ao carregar os dados do painel.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch - default month
    fetchDashboardData()
  }, [])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      setError('Ambas as datas (Início e Fim) devem ser especificadas juntas.')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('A data de início não pode ser posterior à data final.')
      return
    }
    fetchDashboardData(startDate, endDate)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchDashboardData()
  }

  // Format monetary value
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  // Format month index to string
  const formatMonthName = (monthNum: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return months[monthNum - 1] || `${monthNum}`
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Title with Refresh Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meu Painel</h1>
            <p className="text-sm text-slate-500 mt-1">Acompanhe suas receitas, despesas e metas financeiras em tempo real.</p>
          </div>
          <button
            onClick={() => fetchDashboardData(startDate || undefined, endDate || undefined)}
            disabled={loading}
            className="self-start px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Date Filter Bar */}
        <form onSubmit={handleFilter} className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row items-end gap-4 shadow-sm">
          <div className="w-full md:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">De (Início)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Até (Fim)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-lg text-xs transition-all duration-200"
            >
              Filtrar
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilter}
                disabled={loading}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs transition-all duration-200"
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Error notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        {/* Loading Spinner Over Entire Body */}
        {loading && !dashboard ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Obtendo estatísticas financeiras...</p>
          </div>
        ) : dashboard ? (
          <div className="space-y-8">
            
            {/* Top 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Balance */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Saldo Geral</span>
                  <span className={`text-xl sm:text-2xl font-bold font-mono tracking-tight block mt-2 ${dashboard.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {formatCurrency(dashboard.balance)}
                  </span>
                </div>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${dashboard.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 2: Income */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Receitas</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight block mt-2 text-emerald-600">
                    {formatCurrency(dashboard.totalIncome)}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 3: Expense */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Despesas</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight block mt-2 text-red-600">
                    {formatCurrency(dashboard.totalExpense)}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>

              {/* Stat 4: Transaction Count */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Lançamentos</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight block mt-2 text-slate-800">
                    {dashboard.transactionCount}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                  <ListCollapse className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Middle Section: Progress and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Despesas por Categoria */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gastos por Categoria</h3>
                  <p className="text-xs text-slate-400 mt-1">Sua distribuição de despesas por categoria real.</p>
                </div>
                
                <div className="mt-6 space-y-4">
                  {dashboard.expenseByCategory.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <FolderMinus className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma despesa para exibir.</p>
                    </div>
                  ) : (
                    dashboard.expenseByCategory.map((item) => {
                      // Calculate percentage based on totalExpense
                      const percent = dashboard.totalExpense > 0 
                        ? Math.min(100, Math.round((item.total / dashboard.totalExpense) * 100)) 
                        : 0
                      return (
                        <div key={item.categoryId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">{item.categoryName}</span>
                            <span className="font-mono tabular-nums text-slate-500 font-semibold">
                              {formatCurrency(item.total)} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Resumo Mensal */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Resumo Mensal</h3>
                  <p className="text-xs text-slate-400 mt-1">Gráfico de desempenho mensal comparando receitas e despesas.</p>
                </div>

                <div className="mt-6 space-y-4">
                  {dashboard.monthlySummary.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Calendar className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhum resumo disponível.</p>
                    </div>
                  ) : (
                    dashboard.monthlySummary.map((summary, idx) => {
                      const maxVal = Math.max(...dashboard.monthlySummary.map(s => Math.max(s.totalIncome, s.totalExpense))) || 1
                      const incomePercent = Math.min(100, Math.round((summary.totalIncome / maxVal) * 100))
                      const expensePercent = Math.min(100, Math.round((summary.totalExpense / maxVal) * 100))
                      
                      return (
                        <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 space-y-2">
                          <p className="text-xs font-bold text-slate-800">
                            {formatMonthName(summary.month)} / {summary.year}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 w-16 select-none shrink-0">Receitas</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded transition-all duration-500"
                                  style={{ width: `${incomePercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-emerald-600 w-24 text-right">
                                {formatCurrency(summary.totalIncome)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 w-16 select-none shrink-0">Despesas</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 rounded transition-all duration-500"
                                  style={{ width: `${expensePercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-red-600 w-24 text-right">
                                {formatCurrency(summary.totalExpense)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Top Expenses and Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Maiores Despesas */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Maiores Despesas</h3>
                <div className="divide-y divide-slate-100">
                  {dashboard.topExpenses.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma despesa para listar.</p>
                    </div>
                  ) : (
                    dashboard.topExpenses.map((expense) => (
                      <div key={expense.transactionId} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors rounded-lg px-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{expense.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {expense.categoryName} <span className="mx-1 select-none">·</span> {expense.date}
                          </p>
                        </div>
                        <span className="font-semibold text-red-600 font-mono tabular-nums text-right ml-4">
                          - {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lançamentos Recentes */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Lançamentos Recentes</h3>
                <div className="divide-y divide-slate-100">
                  {dashboard.recentTransactions.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma transação recente encontrada.</p>
                    </div>
                  ) : (
                    dashboard.recentTransactions.map((tx) => (
                      <div key={tx.transactionId} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors rounded-lg px-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{tx.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {tx.categoryName} <span className="mx-1 select-none">·</span> {tx.date}
                          </p>
                        </div>
                        <span className={`font-semibold font-mono tabular-nums text-right ml-4 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium">
            Nenhum dado financeiro encontrado. Comece adicionando novas categorias e transações.
          </div>
        )}

      </div>
    </Layout>
  )
}
