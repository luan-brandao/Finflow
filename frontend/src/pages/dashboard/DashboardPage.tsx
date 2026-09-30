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
  CreditCard,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import Layout from '../../components/Layout'
import dashboardService from '../../services/dashboardService'
import userService from '../../services/userService'
import cardService from '../../services/cardService'
import categoryService from '../../services/categoryService'
import type { DashboardResponse, User, Card, Category } from '../../types'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Dynamic filters
  const [selectedCardId, setSelectedCardId] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedType, setSelectedType] = useState('')

  // Filter option lists
  const [cards, setCards] = useState<Card[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Filters collapsibility
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const fetchDashboardAndProfile = async (
    start?: string,
    end?: string,
    cardId?: string,
    catId?: string,
    type?: string
  ) => {
    setLoading(true)
    setError('')
    try {
      const [dashData, profData] = await Promise.all([
        dashboardService.getDashboard(start, end, cardId, catId, type),
        profile ? Promise.resolve(profile) : userService.getMe()
      ])
      setDashboard(dashData)
      setProfile(profData)
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
    // Fetch filter options once
    cardService.findAll().then(setCards).catch(console.error)
    categoryService.findAll().then(setCategories).catch(console.error)
  }, [])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError('Ambas as datas (Início e Fim) devem ser especificadas.')
      return
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('A data de início não pode ser posterior à data final.')
      return
    }
    fetchDashboardAndProfile(
      startDate || undefined,
      endDate || undefined,
      selectedCardId || undefined,
      selectedCategoryId || undefined,
      selectedType || undefined
    )
  }

  const handleClearFilter = () => {
    setStartDate('')
    setEndDate('')
    setSelectedCardId('')
    setSelectedCategoryId('')
    setSelectedType('')
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

  // 3. Expenses by Category Chart: Horizontal high-density progress lines (Controle de Gastos)
  const renderExpensesCategoryChart = () => {
    if (!dashboard || dashboard.expenseByCategory.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem despesas registradas neste período.</p>
        </div>
      )
    }

    const totalExpense = dashboard.totalExpense || 1

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participação no Total de Gastos</h4>
          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded font-mono">
            Total: {formatCurrency(totalExpense)}
          </span>
        </div>
        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
          {dashboard.expenseByCategory.map((item) => {
            const percent = Math.min(100, Math.round((item.total / totalExpense) * 100))

            return (
              <div key={item.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-700 font-bold truncate">{item.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-500 font-semibold shrink-0">
                    <span>{formatCurrency(item.total)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-700">{percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
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

  // 4. Distribution Chart: Premium SVG Donut/Rosca Chart for Category Totals
  const renderDistributionChart = () => {
    if (!dashboard || dashboard.expenseByCategory.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <FolderMinus className="w-8 h-8" />
          <p className="text-xs font-semibold">Sem distribuição cadastrada.</p>
        </div>
      )
    }

    const items = dashboard.expenseByCategory.slice(0, 6) // Show top 6 categories
    const totalExpense = dashboard.totalExpense || 1
    const size = 200
    const center = size / 2
    const r = 60
    const strokeWidth = 24
    const circumference = 2 * Math.PI * r // ~376.99

    let accumulatedPercent = 0

    // High fidelity color palette matching category styles
    const colors = [
      '#4F46E5', // Indigo
      '#EF4444', // Red
      '#F59E0B', // Amber
      '#10B981', // Emerald
      '#EC4899', // Pink
      '#06B6D4'  // Cyan
    ]

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        {/* SVG Donut */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Segment slices */}
            {items.map((item, idx) => {
              const percent = item.total / totalExpense
              const strokeDashoffset = circumference - percent * circumference
              const rotationAngle = -90 + (accumulatedPercent * 360)
              accumulatedPercent += percent
              const color = colors[idx % colors.length]

              return (
                <circle
                  key={item.categoryId}
                  cx={center}
                  cy={center}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotationAngle} ${center} ${center})`}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out cursor-pointer hover:opacity-90"
                >
                  <title>{`${item.categoryName}: ${formatCurrency(item.total)} (${Math.round(percent * 100)}%)`}</title>
                </circle>
              )
            })}
          </svg>
          {/* Central absolute hole content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total</span>
            <span className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{formatCurrency(dashboard.totalExpense)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 text-xs max-w-[200px] w-full">
          {items.map((item, idx) => {
            const percent = Math.round((item.total / totalExpense) * 100)
            const bgColors = ['bg-indigo-600', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500', 'bg-cyan-500']
            const colorClass = bgColors[idx % bgColors.length]

            return (
              <div key={item.categoryId} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colorClass}`} />
                  <span className="font-bold text-slate-700 truncate">{item.categoryName}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-400 shrink-0">
                  <span>({percent}%)</span>
                </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Olá, {profile ? profile.name : 'Carregando...'}</span>
              <span className="animate-wiggle select-none text-2xl">👋</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
              Seja bem-vindo de volta! Aqui está o resumo das suas finanças pessoais.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardAndProfile(
              startDate || undefined,
              endDate || undefined,
              selectedCardId || undefined,
              selectedCategoryId || undefined,
              selectedType || undefined
            )}
            disabled={loading}
            className="self-start px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Painel</span>
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100/80 dark:border-red-900/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {/* Filters and Date Selector Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all select-none cursor-pointer ${
                  isFilterOpen || (startDate || endDate || selectedCardId || selectedCategoryId || selectedType)
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400'
                    : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>🔎 Filtros{(() => {
                  let count = 0
                  if (startDate && endDate) count += 1
                  if (selectedCardId) count += 1
                  if (selectedCategoryId) count += 1
                  if (selectedType) count += 1
                  return count > 0 ? ` • ${count}` : ''
                })()}</span>
                {isFilterOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                )}
              </button>

              {(startDate || endDate || selectedCardId || selectedCategoryId || selectedType) && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  disabled={loading}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition-all select-none cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {(startDate || endDate || selectedCardId || selectedCategoryId || selectedType) && (
            <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 dark:bg-slate-900/40 p-2 border border-slate-100 dark:border-slate-800/60 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Filtros ativos:</span>
              
              {startDate && endDate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                  <span>
                    {(() => {
                      const startParts = startDate.split('-')
                      const endParts = endDate.split('-')
                      if (startParts[0] === endParts[0] && startParts[1] === endParts[1] && startParts[2] === '01') {
                        const dateObj = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, 1)
                        const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        return monthName.charAt(0).toUpperCase() + monthName.slice(1)
                      }
                      return `${startParts.reverse().join('/')} - ${endParts.reverse().join('/')}`
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('')
                      setEndDate('')
                      fetchDashboardAndProfile(
                        undefined,
                        undefined,
                        selectedCardId || undefined,
                        selectedCategoryId || undefined,
                        selectedType || undefined
                      )
                    }}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded transition-colors text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remover filtro de data"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCardId && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                  <span>{cards.find(c => c.id === selectedCardId)?.name || 'Cartão'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardId('')
                      fetchDashboardAndProfile(
                        startDate || undefined,
                        endDate || undefined,
                        undefined,
                        selectedCategoryId || undefined,
                        selectedType || undefined
                      )
                    }}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded transition-colors text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remover filtro de cartão"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategoryId && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                  <span>{categories.find(c => c.id === selectedCategoryId)?.name || 'Categoria'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId('')
                      fetchDashboardAndProfile(
                        startDate || undefined,
                        endDate || undefined,
                        selectedCardId || undefined,
                        undefined,
                        selectedType || undefined
                      )
                    }}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded transition-colors text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remover filtro de categoria"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                  <span>{selectedType === 'INCOME' ? 'Receitas' : 'Despesas'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType('')
                      fetchDashboardAndProfile(
                        startDate || undefined,
                        endDate || undefined,
                        selectedCardId || undefined,
                        selectedCategoryId || undefined,
                        undefined
                      )
                    }}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded transition-colors text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remover filtro de tipo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Collapsible Panel content */}
          <div className={`transition-all duration-300 ease-in-out origin-top ${isFilterOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden pointer-events-none'}`}>
            <form onSubmit={handleFilter} className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">De (Início)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-750 dark:text-slate-200"
                    />
                  </div>
                </div>
                
                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Até (Fim)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-550 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-750 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Credit Card Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Cartão</label>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="">Todos os Cartões</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Categoria</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="">Todas as Categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Tipo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="INCOME">Receitas (Entradas)</option>
                    <option value="EXPENSE">Despesas (Saídas)</option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-2.5 w-full border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <button
                  type="button"
                  onClick={handleClearFilter}
                  disabled={loading}
                  className="mr-auto px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer"
                >
                  Limpar filtros
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all duration-200 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Aplicar filtros
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Page Content Render Area */}
        {loading && !dashboard ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Sincronizando estatísticas...</p>
          </div>
        ) : dashboard ? (
          (() => {
            const monthlyIncome = dashboard.monthlyIncome || 0
            const localCards: Card[] = dashboard.cardsSummary || []
            return (
              <div className="space-y-10 animate-fade-in">
            
            {/* 4 Cards Stat Grid */}
            <div id="tour-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Balance */}
              <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Saldo Geral</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${dashboard.balance >= 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-2xl font-extrabold font-mono tracking-tight block ${dashboard.balance >= 0 ? 'text-slate-950 dark:text-white' : 'text-red-600 dark:text-red-450'}`}>
                    {formatCurrency(dashboard.balance)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Saldo consolidado do período</span>
                </div>
              </div>

              {/* Card 2: Receitas */}
              <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Receitas</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(dashboard.totalIncome)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Total acumulado de entradas</span>
                </div>
              </div>

              {/* Card 3: Despesas */}
              <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Despesas</span>
                  <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-red-600 dark:text-red-400">
                    {formatCurrency(dashboard.totalExpense)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Total acumulado de saídas</span>
                </div>
              </div>

              {/* Card 4: Lançamentos Count */}
              <div className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Lançamentos</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                    <ListCollapse className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold font-mono tracking-tight block text-slate-800 dark:text-slate-100">
                    {dashboard.transactionCount}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">Quantidade total de registros</span>
                </div>
              </div>

            </div>

            {/* Visual Budget & Cards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Roteiro e Planejamento Mensal */}
              <div id="tour-budget" className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Planejamento e Orçamento</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono font-semibold">Renda de Referência</span>
                </div>

                <div className="space-y-4">
                  {/* Renda Mensal */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs font-semibold">
                        R$
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Renda Mensal</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium font-semibold">Referência cadastrada</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono tabular-nums">
                      {formatCurrency(monthlyIncome)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 dark:bg-slate-800 border-dashed" />
                  </div>

                  {/* Receitas */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">Receitas Atuais</span>
                        <span className="text-xs text-slate-400 dark:text-slate-550 font-medium font-semibold">Entradas acumuladas</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      + {formatCurrency(dashboard.totalIncome)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 dark:bg-slate-800 border-dashed" />
                  </div>

                  {/* Despesas */}
                  <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-red-700 dark:text-red-400 font-bold uppercase tracking-wider block">Despesas Atuais</span>
                        <span className="text-xs text-slate-400 dark:text-slate-550 font-medium font-semibold">Saídas acumuladas</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-red-600 dark:text-red-400 font-mono tabular-nums">
                      - {formatCurrency(dashboard.totalExpense)}
                    </span>
                  </div>

                  {/* Flow Indicator line */}
                  <div className="flex justify-center -my-2">
                    <div className="h-4 w-0.5 bg-slate-200 dark:bg-slate-800 border-dashed" />
                  </div>

                  {/* Valor Disponível */}
                  {(() => {
                    const totalAvailable = monthlyIncome + dashboard.totalIncome - dashboard.totalExpense
                    const isPositive = totalAvailable >= 0
                    return (
                      <div className={`flex items-center justify-between p-3 rounded-xl ${isPositive ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : 'bg-red-50/60 dark:bg-red-950/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-semibold ${isPositive ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400' : 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400'}`}>
                            =
                          </div>
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">Valor Disponível</span>
                            <span className="text-xs text-slate-400 dark:text-slate-550 font-medium font-semibold">Renda + Receitas - Despesas</span>
                          </div>
                        </div>
                        <span className={`font-extrabold font-mono tabular-nums ${isPositive ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
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
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">% da Renda Comprometido</span>
                          <span className={`font-mono font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {committedPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : committedPercent > 75 ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                            style={{ width: `${committedPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-semibold">
                          Despesas acumuladas em relação à sua renda mensal de referência.
                        </p>
                      </div>
                    )
                  })()}

                </div>
              </div>

              {/* Card 2: Visão Geral de Cartões de Crédito */}
              <div id="tour-cards" className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Seus Cartões de Crédito</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono font-semibold">Bandeira / Limites</span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  {localCards.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <CreditCard className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhum cartão cadastrado.</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center max-w-xs font-semibold">
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
                          <div key={card.id} className="p-3.5 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{card.name}</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                {formatCurrency(card.used)} / {formatCurrency(card.limit)}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 dark:bg-indigo-50 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                                <span>{percent}% Limite Utilizado</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(available)} Disp.</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {localCards.length > 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium font-semibold mt-4">
                    Limites atualizados dinamicamente com base nas despesas associadas.
                  </p>
                )}
              </div>

            </div>

            {/* Dynamic Dashboard Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Distribuição de Despesas por Categoria */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Despesas por Categoria (Distribuição)</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Divisão percentual de cada categoria no total de saídas do período.</p>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[250px]">
                  {renderDistributionChart()}
                </div>
              </div>

              {/* Card 2: Evolução Financeira */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Evolução Financeira</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Acompanhamento do saldo líquido mês a mês.</p>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[250px]">
                  {renderEvolutionChart()}
                </div>
              </div>

              {/* Card 3: Receitas vs Despesas */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Receitas x Despesas</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Comparativo mensal entre receitas e despesas acumuladas.</p>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[250px]">
                  {renderComparisonChart()}
                </div>
              </div>

              {/* Card 4: Controle de Gastos por Categoria */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Participação de Gastos</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Proporção individual de despesas por categoria no total de gastos.</p>
                </div>
                <div className="flex-1 flex flex-col justify-center min-h-[250px]">
                  {renderExpensesCategoryChart()}
                </div>
              </div>

            </div>

            {/* Bottom Grid: Top Expenses and Recent Transactions list in elegant unboxed layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Maiores Despesas Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Maiores Despesas</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">Destaques</span>
                </div>

                <div className="space-y-1">
                  {dashboard.topExpenses.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma despesa para listar.</p>
                    </div>
                  ) : (
                    dashboard.topExpenses.map((expense) => (
                      <div key={expense.transactionId} className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors rounded-xl group">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{expense.description}</p>
                          {/* Unboxed Metadata with · separator */}
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-2">
                            <span>{expense.categoryName}</span>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 font-normal">·</span>
                            <span>{expense.date}</span>
                          </p>
                        </div>
                        <span className="font-extrabold text-red-600 dark:text-red-400 font-mono tabular-nums text-right ml-4 shrink-0">
                          - {formatCurrency(expense.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lançamentos Recentes Card */}
              <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Últimos Lançamentos</h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">Linha do tempo</span>
                </div>

                <div className="space-y-1">
                  {dashboard.recentTransactions.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                      <Receipt className="w-8 h-8" />
                      <p className="text-xs font-semibold">Nenhuma transação registrada.</p>
                    </div>
                  ) : (
                    dashboard.recentTransactions.map((tx) => (
                      <div key={tx.transactionId} className="p-3.5 flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors rounded-xl group">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                          {/* Unboxed Metadata with · separator */}
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-2">
                            <span>{tx.categoryName}</span>
                            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 font-normal">·</span>
                            <span>{tx.date}</span>
                          </p>
                        </div>
                        <span className={`font-extrabold font-mono tabular-nums text-right ml-4 shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
            )
          })()
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium">
            Nenhum dado financeiro encontrado para este período. Comece a lançar transações.
          </div>
        )}

      </div>
    </Layout>
  )
}
