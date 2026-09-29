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
  Receipt,
  CreditCard
} from 'lucide-react'
import Layout from '../../components/Layout'
import dashboardService from '../../services/dashboardService'
import userService from '../../services/userService'
import type { DashboardResponse, User, Card } from '../../types'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Custom Local budget and cards states
  const [localCards, setLocalCards] = useState<Card[]>([])
  const [monthlyIncome, setMonthlyIncome] = useState<number>(4500)

  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Selected chart view
  const [activeChart, setActiveChart] = useState<'evolution' | 'comparison' | 'expenses_category' | 'distribution'>('evolution')

  const fetchDashboardAndProfile = async (start?: string, end?: string) => {
    setLoading(true)
    setError('')
    try {
      const [dashData, profData] = await Promise.all([
        dashboardService.getDashboard(start, end),
        profile ? Promise.resolve(profile) : userService.getMe()
      ])
      setDashboard(dashData)
      setProfile(profData)

      // Load custom Monthly Income
      const storedIncome = localStorage.getItem('finflow_monthly_income')
      if (storedIncome) {
        setMonthlyIncome(parseFloat(storedIncome))
      } else {
        localStorage.setItem('finflow_monthly_income', '4500.00')
        setMonthlyIncome(4500)
      }

      // Load Credit Cards
      const storedCards = localStorage.getItem('finflow_local_cards')
      if (storedCards) {
        setLocalCards(JSON.parse(storedCards))
      } else {
        const defaultCards: Card[] = [
          { id: 'nubank-seed', name: 'Nubank', limit: 3000, used: 350 },
          { id: 'itau-seed', name: 'Itaú', limit: 5000, used: 1200 }
        ]
        localStorage.setItem('finflow_local_cards', JSON.stringify(defaultCards))
        setLocalCards(defaultCards)
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erro ao carregar dados do painel.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardAndProfile()
  }, [])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      setError('Ambas as datas (Início e Fim) devem ser especificadas.')
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('A data de início não pode ser posterior à data final.')
      return
    }
    fetchDashboardAndProfile(startDate, endDate)
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    fetchDashboardAndProfile()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  const formatMonthName = (monthNum: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]
    return months[monthNum - 1] || `${monthNum}`
  }

  // --- SVG CHART RENDERERS ---

  // 1. Evolution Chart: Smooth gradient area plot of Net Income (Income - Expense) over months
  const renderEvolutionChart = () => {
    if (!dashboard || dashboard.monthlySummary.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem dados de evolução histórica.</p>
        </div>
      )
    }

    const data = [...dashboard.monthlySummary].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const netValues = data.map(s => s.totalIncome - s.totalExpense)
    const maxVal = Math.max(...netValues.map(Math.abs)) || 1
    
    // SVG Dimensions
    const width = 600
    const height = 240
    const padding = 40
    
    // Plot points
    const points = data.map((s, index) => {
      const net = s.totalIncome - s.totalExpense
      const x = padding + (index * (width - 2 * padding)) / Math.max(1, data.length - 1)
      // center line is height / 2. scale values relative to that.
      const y = (height / 2) - (net / maxVal) * (height / 2 - padding)
      return { x, y, net, month: formatMonthName(s.month), year: s.year }
    })

    // Construct path coordinates
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : ''

    return (
      <div className="space-y-4">
        <div className="relative overflow-x-auto">
          <svg className="w-full min-w-[500px] h-[240px]" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="chart-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            
            {/* Zero midline */}
            <line 
              x1={padding} 
              y1={height / 2} 
              x2={width - padding} 
              y2={height / 2} 
              stroke="#E2E8F0" 
              strokeDasharray="4 4" 
              strokeWidth="1.5"
            />

            {/* Grid Helper Lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F1F5F9" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#F1F5F9" strokeWidth="1" />

            {/* Area under the line */}
            {areaPath && (
              <path d={areaPath} fill="url(#chart-area-grad)" className="transition-all duration-300" />
            )}

            {/* Line plot */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="#4F46E5" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* Scatter dots */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="5" 
                  fill="#FFFFFF" 
                  stroke="#4F46E5" 
                  strokeWidth="3" 
                  className="transition-transform duration-200 hover:scale-150"
                />
                {/* Micro tooltip label */}
                <text 
                  x={p.x} 
                  y={p.y - 12} 
                  textAnchor="middle" 
                  className="text-[10px] font-bold font-mono fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {p.net >= 0 ? '+' : ''}{formatCurrency(p.net)}
                </text>
              </g>
            ))}

            {/* X Axis labels */}
            {points.map((p, idx) => (
              <text 
                key={idx} 
                x={p.x} 
                y={height - 12} 
                textAnchor="middle" 
                className="text-[11px] font-semibold text-slate-400 select-none fill-slate-400"
              >
                {p.month}
              </text>
            ))}
          </svg>
        </div>
        <p className="text-[11px] text-slate-400 text-center font-medium">
          Mostrando o saldo líquido mensal (Receitas - Despesas). Valores positivos indicam poupança ativa.
        </p>
      </div>
    )
  }

  // 2. Comparison Chart: Monthly side-by-side vertical bar chart comparing total incomes and expenses
  const renderComparisonChart = () => {
    if (!dashboard || dashboard.monthlySummary.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem dados de comparação para exibir.</p>
        </div>
      )
    }

    const data = [...dashboard.monthlySummary].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })

    const maxVal = Math.max(...data.map(s => Math.max(s.totalIncome, s.totalExpense))) || 1
    
    // SVG Dimensions
    const width = 600
    const height = 240
    const padding = 40
    const barWidth = 14
    const barGap = 6

    return (
      <div className="space-y-4">
        <div className="relative overflow-x-auto">
          <svg className="w-full min-w-[500px] h-[240px]" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid helpers */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F1F5F9" strokeWidth="1" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#F1F5F9" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2E8F0" strokeWidth="1.5" />

            {data.map((s, index) => {
              const xCenter = padding + (index * (width - 2 * padding)) / Math.max(1, data.length - 1)
              
              // Heights
              const incHeight = ((s.totalIncome / maxVal) * (height - 2 * padding))
              const expHeight = ((s.totalExpense / maxVal) * (height - 2 * padding))

              const xInc = xCenter - barWidth - (barGap / 2)
              const xExp = xCenter + (barGap / 2)
              const yInc = height - padding - incHeight
              const yExp = height - padding - expHeight

              return (
                <g key={index}>
                  {/* Income bar */}
                  {s.totalIncome > 0 && (
                    <rect 
                      x={xInc} 
                      y={yInc} 
                      width={barWidth} 
                      height={incHeight} 
                      fill="#10B981" 
                      rx="3"
                      className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    >
                      <title>{`Receitas: ${formatCurrency(s.totalIncome)}`}</title>
                    </rect>
                  )}
                  {/* Expense bar */}
                  {s.totalExpense > 0 && (
                    <rect 
                      x={xExp} 
                      y={yExp} 
                      width={barWidth} 
                      height={expHeight} 
                      fill="#EF4444" 
                      rx="3"
                      className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    >
                      <title>{`Despesas: ${formatCurrency(s.totalExpense)}`}</title>
                    </rect>
                  )}
                  {/* X Axis label */}
                  <text 
                    x={xCenter} 
                    y={height - 12} 
                    textAnchor="middle" 
                    className="text-[11px] font-semibold fill-slate-400"
                  >
                    {formatMonthName(s.month)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <span className="text-slate-500">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-sm" />
            <span className="text-slate-500">Despesas</span>
          </div>
        </div>
      </div>
    )
  }

  // 3. Expenses by Category Chart: Horizontal high-density progress lines
  const renderExpensesCategoryChart = () => {
    if (!dashboard || dashboard.expenseByCategory.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem despesas registradas neste período.</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Composição dos Gastos</h4>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
          {dashboard.expenseByCategory.map((item, idx) => {
            const percent = dashboard.totalExpense > 0 
              ? Math.min(100, Math.round((item.total / dashboard.totalExpense) * 100)) 
              : 0
            
            // Premium palette of categorical colors
            const colors = [
              'bg-indigo-600',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-pink-500',
              'bg-cyan-500',
              'bg-rose-500'
            ]
            const colorClass = colors[idx % colors.length]

            return (
              <div key={item.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 font-semibold">{item.categoryName}</span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 font-semibold">
                    <span>{formatCurrency(item.total)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-800 font-bold">{percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // 4. Distribution Chart: Concentric layered circles (futuristic metric rings) for category totals
  const renderDistributionChart = () => {
    if (!dashboard || dashboard.expenseByCategory.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem distribuição cadastrada.</p>
        </div>
      )
    }

    const items = dashboard.expenseByCategory.slice(0, 4) // Show top 4 categories as rings
    const size = 200
    const center = size / 2

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        {/* Layered ring display */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="w-full h-full transform -rotate-90">
            {items.map((item, idx) => {
              const radius = 30 + idx * 16
              const circumference = 2 * Math.PI * radius
              const percent = dashboard.totalExpense > 0 
                ? (item.total / dashboard.totalExpense)
                : 0
              const strokeDashoffset = circumference - percent * circumference
              
              // Colors
              const ringColors = ['#4F46E5', '#10B981', '#F59E0B', '#EC4899']
              const color = ringColors[idx % ringColors.length]

              return (
                <g key={item.categoryId}>
                  {/* Track ring */}
                  <circle 
                    cx={center} 
                    cy={center} 
                    r={radius} 
                    fill="none" 
                    stroke="#F1F5F9" 
                    strokeWidth="5" 
                  />
                  {/* Progressive ring fill */}
                  <circle 
                    cx={center} 
                    cy={center} 
                    r={radius} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="5" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </g>
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Despesas</span>
            <span className="text-sm font-bold text-slate-700 font-mono">{formatCurrency(dashboard.totalExpense)}</span>
          </div>
        </div>

        {/* Small Concentric Legend */}
        <div className="space-y-2 text-xs">
          {items.map((item, idx) => {
            const ringColors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500']
            const percent = dashboard.totalExpense > 0 
              ? Math.round((item.total / dashboard.totalExpense) * 100)
              : 0
            return (
              <div key={item.categoryId} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${ringColors[idx % ringColors.length]}`} />
                <span className="font-semibold text-slate-600">{item.categoryName}</span>
                <span className="text-slate-400 font-mono font-bold">({percent}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Dynamic Personal Header with Greet Emoji */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Olá, {profile ? profile.name : 'Carregando...'}</span>
              <span className="animate-wiggle select-none text-2xl">👋</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Seja bem-vindo de volta! Aqui está o resumo das suas finanças pessoais.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardAndProfile(startDate || undefined, endDate || undefined)}
            disabled={loading}
            className="self-start px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Painel</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-700">{error}</span>
          </div>
        )}

        {/* Filters and Date Selector Bar */}
        <form onSubmit={handleFilter} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-end gap-4 shadow-sm">
          <div className="w-full md:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">De (Início)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-700"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Até (Fim)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all duration-200"
            >
              Aplicar Filtro
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilter}
                disabled={loading}
                className="flex-1 md:flex-none px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all duration-200"
              >
                Limpar
              </button>
            )}
          </div>
        </form>

        {/* Page Content Render Area */}
        {loading && !dashboard ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Sincronizando estatísticas...</p>
          </div>
        ) : dashboard ? (
          <div className="space-y-10 animate-fade-in">
            
            {/* 4 Cards Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Balance */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Saldo Geral</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dashboard.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-2xl font-extrabold font-mono tracking-tight block ${dashboard.balance >= 0 ? 'text-slate-950' : 'text-red-600'}`}>
                    {formatCurrency(dashboard.balance)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Saldo consolidado do período</span>
                </div>
              </div>

              {/* Card 2: Receitas */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Receitas</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-emerald-600">
                    {formatCurrency(dashboard.totalIncome)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Total acumulado de entradas</span>
                </div>
              </div>

              {/* Card 3: Despesas */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Despesas</span>
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-red-600">
                    {formatCurrency(dashboard.totalExpense)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Total acumulado de saídas</span>
                </div>
              </div>

              {/* Card 4: Lançamentos Count */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Lançamentos</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                    <ListCollapse className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-slate-800">
                    {dashboard.transactionCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1">Quantidade total de registros</span>
                </div>
              </div>

            </div>

            {/* Visual Budget & Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Roteiro e Planejamento Mensal */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 pb-4 mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Planejamento e Orçamento</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-semibold">Renda de Referência</span>
                </div>

                <div className="space-y-4">
                  {/* Renda Mensal */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-semibold">
                        R$
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Renda Mensal</span>
                        <span className="text-xs text-slate-400 font-medium font-semibold">Referência cadastrada</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-800 font-mono tabular-nums">
                      {formatCurrency(monthlyIncome)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 border-dashed" />
                  </div>

                  {/* Receitas */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">Receitas Atuais</span>
                        <span className="text-xs text-slate-400 font-medium font-semibold">Entradas acumuladas</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 font-mono tabular-nums">
                      + {formatCurrency(dashboard.totalIncome)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 border-dashed" />
                  </div>

                  {/* Despesas */}
                  <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-red-700 font-bold uppercase tracking-wider block">Despesas Atuais</span>
                        <span className="text-xs text-slate-400 font-medium font-semibold">Saídas acumuladas</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-red-600 font-mono tabular-nums">
                      - {formatCurrency(dashboard.totalExpense)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 border-dashed" />
                  </div>

                  {/* Valor Disponível */}
                  {(() => {
                    const totalAvailable = monthlyIncome + dashboard.totalIncome - dashboard.totalExpense
                    const isPositive = totalAvailable >= 0
                    return (
                      <div className={`flex items-center justify-between p-3 rounded-xl ${isPositive ? 'bg-indigo-50/60' : 'bg-red-50/60'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-semibold ${isPositive ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                            =
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-700">Valor Disponível</span>
                            <span className="text-xs text-slate-400 font-medium font-semibold">Renda + Receitas - Despesas</span>
                          </div>
                        </div>
                        <span className={`font-extrabold font-mono tabular-nums ${isPositive ? 'text-indigo-600' : 'text-red-600'}`}>
                          {formatCurrency(totalAvailable)}
                        </span>
                      </div>
                    )
                  })()}

                  {/* Percentual Comprometido & Progress Bar */}
                  {(() => {
                    const committedPercent = monthlyIncome > 0 
                      ? Math.min(100, Math.round((dashboard.totalExpense / monthlyIncome) * 100)) 
                      : 0
                    const isOverBudget = committedPercent >= 100
                    return (
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500 font-semibold">% da Renda Comprometido</span>
                          <span className={`font-mono font-bold ${isOverBudget ? 'text-red-600' : 'text-indigo-600'}`}>
                            {committedPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : committedPercent > 75 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                            style={{ width: `${committedPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium font-semibold">
                          Despesas acumuladas em relação à sua renda mensal de referência.
                        </p>
                      </div>
                    )
                  })()}

                </div>
              </div>

              {/* Card 2: Visão Geral de Cartões de Crédito */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Seus Cartões de Crédito</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-semibold">Bandeira / Limites</span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {localCards.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CreditCard className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhum cartão cadastrado.</p>
                      <p className="text-[10px] text-slate-400 text-center max-w-xs font-semibold">
                        Adicione cartões de crédito na seção "Cartões" para visualizar o progresso dos limites aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {localCards.map((card) => {
                        const available = card.limit - card.used
                        const percent = card.limit > 0 
                          ? Math.min(100, Math.round((card.used / card.limit) * 100)) 
                          : 0
                        return (
                          <div key={card.id} className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-800">{card.name}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-500">
                                {formatCurrency(card.used)} / {formatCurrency(card.limit)}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold font-mono">
                                <span>{percent}% Limite Utilizado</span>
                                <span className="text-emerald-600 font-bold">{formatCurrency(available)} Disp.</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {localCards.length > 0 && (
                  <p className="text-[10px] text-slate-400 text-center font-medium font-semibold mt-4">
                    Limites atualizados dinamicamente com base nas despesas associadas.
                  </p>
                )}
              </div>

            </div>

            {/* Central High-Fidelity SVG Chart Selector Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Análise Gráfica Dinâmica</h3>
                  <p className="text-xs text-slate-400 mt-1">Selecione uma visualização para monitorar os dados em tempo real.</p>
                </div>
                
                {/* Chart segment select button group */}
                <div className="flex p-1 bg-slate-100 rounded-xl max-w-full overflow-x-auto select-none">
                  <button
                    onClick={() => setActiveChart('evolution')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeChart === 'evolution' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Evolução
                  </button>
                  <button
                    onClick={() => setActiveChart('comparison')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeChart === 'comparison' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Receita vs Despesa
                  </button>
                  <button
                    onClick={() => setActiveChart('expenses_category')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeChart === 'expenses_category' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Gastos Categoria
                  </button>
                  <button
                    onClick={() => setActiveChart('distribution')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeChart === 'distribution' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Distribuição
                  </button>
                </div>
              </div>

              {/* Selected Chart Rendering Panel */}
              <div className="min-h-[250px] flex flex-col justify-center">
                {activeChart === 'evolution' && renderEvolutionChart()}
                {activeChart === 'comparison' && renderComparisonChart()}
                {activeChart === 'expenses_category' && renderExpensesCategoryChart()}
                {activeChart === 'distribution' && renderDistributionChart()}
              </div>
            </div>

            {/* Bottom Grid: Top Expenses and Recent Transactions list in elegant unboxed layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Maiores Despesas Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Maiores Despesas</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Destaques</span>
                </div>

                <div className="space-y-1">
                  {dashboard.topExpenses.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma despesa para listar.</p>
                    </div>
                  ) : (
                    dashboard.topExpenses.map((expense) => (
                      <div key={expense.transactionId} className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors rounded-xl group">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{expense.description}</p>
                          {/* Unboxed Metadata with · separator */}
                          <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-2">
                            <span>{expense.categoryName}</span>
                            <span aria-hidden="true" className="text-slate-300 font-normal">·</span>
                            <span>{expense.date}</span>
                          </p>
                        </div>
                        <span className="font-extrabold text-red-600 font-mono tabular-nums text-right ml-4 shrink-0">
                          - {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lançamentos Recentes Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Últimos Lançamentos</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Linha do tempo</span>
                </div>

                <div className="space-y-1">
                  {dashboard.recentTransactions.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma transação registrada.</p>
                    </div>
                  ) : (
                    dashboard.recentTransactions.map((tx) => (
                      <div key={tx.transactionId} className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors rounded-xl group">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{tx.description}</p>
                          {/* Unboxed Metadata with · separator */}
                          <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-2">
                            <span>{tx.categoryName}</span>
                            <span aria-hidden="true" className="text-slate-300 font-normal">·</span>
                            <span>{tx.date}</span>
                          </p>
                        </div>
                        <span className={`font-extrabold font-mono tabular-nums text-right ml-4 shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
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
            Nenhum dado financeiro encontrado para este período. Comece a lançar transações.
          </div>
        )}

      </div>
    </Layout>
  )
}
