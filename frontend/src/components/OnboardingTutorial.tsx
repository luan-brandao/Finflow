import { useState } from 'react'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  TrendingUp, 
  CreditCard, 
  Check, 
  Sparkles, 
  Loader2, 
  PieChart 
} from 'lucide-react'
import monthlyIncomeService from '../services/monthlyIncomeService'

interface OnboardingTutorialProps {
  onComplete: () => void
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [step, setStep] = useState(1)
  const [income, setIncome] = useState('4500.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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
      setSuccessMsg('Renda de referência configurada com sucesso!')
      setError('')
      // Proceed to next step automatically on success
      setTimeout(() => {
        setStep(2)
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao salvar sua renda de referência no backend. Prossiga para o próximo passo.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    localStorage.setItem('finflow_onboarding_completed', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-8 relative overflow-hidden flex flex-col justify-between min-h-[460px] animate-scale-in">
        
        {/* Floating background gradient light */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>FINFLOW ONBOARDING</span>
          </div>
          <button 
            onClick={handleFinish} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Pular tutorial"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col justify-center py-4">
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Etapa 1 — Sua Renda Mensal</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  O Finflow utiliza sua renda mensal de referência como base para projetar seu limite de orçamento, calcular o valor líquido disponível e medir o percentual de gastos comprometidos.
                </p>
              </div>

              {/* Income form */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Informe sua renda mensal aproximada (R$)</label>
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="relative flex-1">
                    <span className="text-sm font-bold text-slate-400 absolute left-4 top-1/2 -translate-y-1/2">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      disabled={loading}
                      placeholder="Ex: 4500.00"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-mono font-bold text-slate-700"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSaveIncome}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Salvar Renda</span>
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-semibold">{error}</p>
                )}
                {successMsg && (
                  <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Etapa 2 — Seus Cartões de Crédito</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Cadastre seus cartões de crédito informando o nome e o limite disponível. O Finflow é inteligente: ele calcula de forma dinâmica os limites livre e utilizado cruzando as faturas com suas despesas em tempo real.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    <span className="font-bold text-slate-700 block mb-0.5">Como funciona o cálculo:</span>
                    O limite utilizado é a soma de todas as despesas vinculadas àquele cartão. O disponível é o limite total subtraído das despesas. Sem planilhas manuais!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Etapa 3 — Registre suas Despesas</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Ao criar lançamentos, você pode escolher uma Categoria e opcionalmente vincular um Cartão de Crédito (para despesas em faturas) ou deixar sem cartão para transações à vista (PIX, boleto, dinheiro).
                </p>
                <p className="text-xs text-slate-400 font-semibold">
                  ⚠️ <span className="font-bold text-slate-600">Importante:</span> Receitas representam suas entradas financeiras livres e não podem ser associadas a cartões de crédito.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Etapa 4 — Acompanhe seu Dashboard</h3>
                <p className="text-sm text-slate-400 font-semibold leading-relaxed">
                  Com tudo configurado, seu Painel ganha vida! Acompanhe o percentual de renda comprometida, gráficos de distribuição por categoria, evolução histórica e a listagem de maiores despesas sincronizadas diretamente com o banco de dados.
                </p>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <p className="text-xs text-indigo-800 font-bold leading-relaxed text-center">
                  Pronto! Seu ambiente está sincronizado e seguro. Comece a monitorar suas finanças pessoais com o Finflow! 🎉
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 select-none">
            {[1, 2, 3, 4].map((i) => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? 'w-5 bg-indigo-600' : 'bg-slate-200'}`} 
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>Avançar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-500/10"
              >
                <span>Começar</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
