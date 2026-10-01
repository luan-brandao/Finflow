import { useEffect, useState } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  CreditCard, 
  Check, 
  Sparkles, 
  Loader2, 
  Tag,
  LayoutDashboard
} from 'lucide-react'
import monthlyIncomeService from '../services/monthlyIncomeService'
import userService from '../services/userService'

interface OnboardingTutorialProps {
  userId: string
  onComplete: () => void
}

interface StepConfig {
  number: number
  title: string
  description: string
  selector: string | null
  icon: any
}

export default function OnboardingTutorial({ userId: _userId, onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState('4500.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [hasIncome, setIncomeSaved] = useState(false)

  const steps: StepConfig[] = [
    {
      number: 1,
      title: 'Sua Renda Mensal',
      description: 'Comece informando sua renda mensal real. Esse valor será usado como referência principal para o seu orçamento e para calcular o percentual comprometido.',
      selector: null,
      icon: TrendingUp
    },
    {
      number: 2,
      title: 'Seu Painel de Orçamento',
      description: 'Esta área do painel exibe um roteiro completo: sua Renda Mensal, Receitas acumuladas, Despesas correntes, o Valor Líquido Disponível e o percentual de gastos já comprometidos.',
      selector: '#tour-budget',
      icon: LayoutDashboard
    },
    {
      number: 3,
      title: 'Seus Cartões de Crédito',
      description: 'Aqui você acompanha o limite total, o valor utilizado de fatura e o limite disponível de cada cartão. Os valores são atualizados automaticamente com base nas transações.',
      selector: '#tour-cards',
      icon: CreditCard
    },
    {
      number: 4,
      title: 'Registre suas Transações',
      description: 'Ao registrar lançamentos, você pode escolher uma Categoria e vincular a um Cartão de Crédito para compras parceladas ou à vista no cartão. Receitas não utilizam cartão.',
      selector: '#tour-nav-transactions',
      icon: ArrowRight
    },
    {
      number: 5,
      title: 'Categorias e Organização',
      description: 'Crie marcadores e organize suas receitas e despesas por categorias personalizadas para acompanhar a saúde do seu orçamento de forma clara.',
      selector: '#tour-nav-categories',
      icon: Tag
    }
  ]

  const activeStep = steps.find(s => s.number === step) || steps[0]

  // Track the highlighted element position
  useEffect(() => {
    if (!activeStep.selector) {
      setRect(null)
      return
    }

    const updateRect = () => {
      const element = document.querySelector(activeStep.selector!)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Delay slightly to wait for scroll to finish
        setTimeout(() => {
          const r = element.getBoundingClientRect()
          setRect(r)
        }, 100)
      } else {
        setRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect)

    // Interval to poll in case content dynamic loading shifts things
    const interval = setInterval(updateRect, 1000)

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
      clearInterval(interval)
    }
  }, [step, activeStep.selector])

  // Try to load any existing monthly income at start
  useEffect(() => {
    const checkExistingIncome = async () => {
      try {
        const data = await monthlyIncomeService.findCurrentMonthIncome()
        if (data && data.amount > 0) {
          setIncome(data.amount.toString())
          setIncomeSaved(true)
        }
      } catch {
        // No income registered yet
      }
    }
    checkExistingIncome()
  }, [])

  const handleSaveIncome = async () => {
    const val = parseFloat(income)
    if (isNaN(val) || val <= 0) {
      setError('Por favor, informe um valor de renda válido e maior que zero.')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const year = new Date().getFullYear()
      const month = new Date().getMonth() + 1
      await monthlyIncomeService.createOrUpdate({ year, month, amount: val })
      setSuccessMsg('Renda de referência salva com sucesso!')
      setIncomeSaved(true)
      setError('')
      setTimeout(() => {
        setStep(2)
      }, 800)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao salvar sua renda de referência no backend.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!hasIncome) {
      setError('A configuração da renda de referência é obrigatória para concluir o onboarding.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await userService.completeOnboarding()
      onComplete()
    } catch (err: any) {
      console.error(err)
      setError('Erro ao salvar a conclusão do onboarding no backend.')
    } finally {
      setLoading(false)
    }
  }

  const getPopoverStyle = () => {
    if (!rect) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
        width: '100%',
        maxWidth: '480px'
      }
    }

    const popoverWidth = 350
    const spaceBelow = window.innerHeight - (rect.bottom)
    const spaceAbove = rect.top

    let top = rect.bottom + 16
    let left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, rect.left + (rect.width - popoverWidth) / 2))

    if (spaceBelow < 250 && spaceAbove > spaceBelow) {
      // Position above the highlighted rect
      top = rect.top - 280
    }

    // Special case for sidebar items to position to the right
    if (activeStep.selector?.startsWith('#tour-nav-')) {
      left = rect.right + 16
      top = rect.top + (rect.height - 200) / 2
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 16
        top = rect.bottom + 16
      }
    }

    return {
      position: 'fixed' as const,
      top: Math.max(16, Math.min(window.innerHeight - 340, top)),
      left,
      zIndex: 50,
      width: `${popoverWidth}px`
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      
      {/* Spotlight darkened SVG mask panel */}
      {rect ? (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-40 transition-all duration-300">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect 
                x={rect.x - 8} 
                y={rect.y - 8} 
                width={rect.width + 16} 
                height={rect.height + 16} 
                rx="16" 
                ry="16" 
                fill="black" 
              />
            </mask>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="rgba(15, 23, 42, 0.75)" 
            mask="url(#spotlight-mask)" 
            className="transition-all duration-300 pointer-events-auto"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 transition-all duration-300" />
      )}

      {/* Floating Guided Tour Card */}
      <div 
        style={getPopoverStyle()} 
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 animate-scale-in max-h-[calc(100vh-32px)]"
      >
        {/* Floating background gradient light */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Tour Guiado Finflow</span>
          </div>
          {hasIncome && (
            <button 
              onClick={handleFinish} 
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg transition-all font-bold"
              title="Sair do tour guiado"
            >
              Pular tour
            </button>
          )}
        </div>

        {/* Step Content with scroll support */}
        <div className="space-y-4 overflow-y-auto pr-1 select-text scrollbar-thin max-h-[240px] sm:max-h-[320px] flex-1 py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <activeStep.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Etapa {step} de 5</span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">{activeStep.title}</h3>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {activeStep.description}
          </p>

          {/* Special input inside Step 1 */}
          {step === 1 && (
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Insira sua Renda Mensal (R$)</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    disabled={loading}
                    placeholder="Ex: 4500.00"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-mono font-bold text-slate-700"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveIncome}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-sm shadow-indigo-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-600 font-bold leading-snug">{error}</p>
          )}
          {successMsg && (
            <p className="text-[11px] text-emerald-600 font-bold leading-snug">{successMsg}</p>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
          {/* Step dots */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-3.5 bg-indigo-600' : 'bg-slate-200'}`} 
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setError(''); setStep(step - 1); }}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Voltar</span>
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !hasIncome) {
                    setError('Cadastre sua renda de referência antes de avançar.')
                    return
                  }
                  setError('')
                  setStep(step + 1)
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
              >
                <span>Avançar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-500/10"
              >
                <span>Concluir</span>
                <Check className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
