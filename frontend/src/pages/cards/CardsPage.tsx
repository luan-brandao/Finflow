import { useEffect, useState } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  Wallet
} from 'lucide-react'
import Layout from '../../components/Layout'
import cardService from '../../services/cardService'
import ConfirmModal from '../../components/ConfirmModal'
import type { Card } from '../../types'

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states for creating/editing
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [dueDay, setDueDay] = useState('10')

  // Invoice management states
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  // Load cards from API
  const loadCards = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await cardService.findAll()
      setCards(data)
      if (data.length > 0) {
        // Keep selected card reference updated or select the first one by default
        if (selectedCard) {
          const updated = data.find(c => c.id === selectedCard.id)
          if (updated) {
            setSelectedCard(updated)
            // Refresh its invoices too
            const invs = await cardService.getInvoices(updated.id)
            setInvoices(invs)
          } else {
            setSelectedCard(data[0])
            const invs = await cardService.getInvoices(data[0].id)
            setInvoices(invs)
          }
        } else {
          setSelectedCard(data[0])
          const invs = await cardService.getInvoices(data[0].id)
          setInvoices(invs)
        }
      } else {
        setSelectedCard(null)
        setInvoices([])
      }
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar seus cartões de crédito.')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async (cardId: string) => {
    setInvoicesLoading(true)
    try {
      const data = await cardService.getInvoices(cardId)
      setInvoices(data)
    } catch (err) {
      console.error(err)
    } finally {
      setInvoicesLoading(false)
    }
  }

  const handleCloseInvoice = async (cardId: string, year: number, month: number) => {
    setError('')
    setSuccess('')
    try {
      await cardService.closeInvoice(cardId, year, month)
      setSuccess('Fatura fechada com sucesso! O estado para pagamento futuro foi preparado.')
      await fetchInvoices(cardId)
      const data = await cardService.findAll()
      setCards(data)
      const updated = data.find(c => c.id === cardId)
      if (updated) setSelectedCard(updated)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao fechar a fatura.')
    }
  }

  const handlePayInvoice = async (cardId: string, invoiceId: string) => {
    setError('')
    setSuccess('')
    try {
      await cardService.payInvoice(cardId, invoiceId)
      setSuccess('Fatura paga com sucesso! O limite de crédito foi restabelecido.')
      await fetchInvoices(cardId)
      const data = await cardService.findAll()
      setCards(data)
      const updated = data.find(c => c.id === cardId)
      if (updated) setSelectedCard(updated)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao realizar pagamento da fatura.')
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setName('')
    setLimit('')
    setDueDay('10')
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleOpenEdit = (card: Card) => {
    setEditingId(card.id)
    setName(card.name)
    setLimit(card.limit.toString())
    setDueDay(card.dueDay.toString())
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
    if (!name.trim() || !limit) {
      setError('Todos os campos são obrigatórios.')
      return
    }

    const numericLimit = parseFloat(limit)
    if (isNaN(numericLimit) || numericLimit < 0) {
      setError('O limite de crédito deve ser um valor válido.')
      return
    }

    const numericDueDay = parseInt(dueDay)
    if (isNaN(numericDueDay) || numericDueDay < 1 || numericDueDay > 31) {
      setError('O dia de vencimento da fatura deve ser entre 1 e 31.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (editingId) {
        await cardService.update(editingId, {
          name: name.trim(),
          creditLimit: numericLimit,
          dueDay: numericDueDay
        })
        setSuccess('Cartão de crédito atualizado com sucesso!')
      } else {
        await cardService.create({
          name: name.trim(),
          creditLimit: numericLimit,
          dueDay: numericDueDay
        })
        setSuccess('Novo cartão de crédito cadastrado com sucesso!')
      }

      setIsFormOpen(false)
      await loadCards()
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar o cartão de crédito.')
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

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cartões de Crédito</h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">Cadastre e gerencie seus cartões e controle o limite disponível.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cartão</span>
          </button>
        </div>

        {/* Backend Sincronizado Indicator */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl flex items-start gap-3 animate-fade-in">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold leading-relaxed">
            <span className="block font-bold">Ambiente Conectado</span>
            <span className="block font-normal mt-0.5 opacity-90">
              Sua carteira de cartões está totalmente conectada em tempo real ao backend do Finflow. Os limites utilizados são calculados automaticamente de forma segura com base nos lançamentos efetuados.
            </span>
          </div>
        </div>

        {/* Notifications */}
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

        {/* Edit / Create Form overlay section */}
        {isFormOpen && (
          <div className="bg-slate-50 dark:bg-[#1E293B] border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {editingId ? 'Editar Limites do Cartão' : 'Cadastrar Cartão de Crédito'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              
              {/* Card Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nome do Cartão (Instituição)</label>
                <input
                  type="text"
                  maxLength={50}
                  required
                  placeholder="Ex: Nubank, Itaú, Inter..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-250"
                />
              </div>

              {/* Total Limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Limite de Crédito Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ex: 5000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Due Day */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Dia de Vencimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="Ex: 10"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none transition-all font-mono font-bold text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="sm:col-span-3 flex justify-end gap-3 pt-3">
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
                  className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Cartão</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Interactive Visual Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Buscando seus cartões de crédito...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm animate-fade-in">
            <CreditCard className="w-12 h-10 text-slate-300 dark:text-slate-750" />
            <p className="text-sm font-bold">Nenhum cartão cadastrado.</p>
            <p className="text-xs max-w-xs leading-relaxed text-slate-400 dark:text-slate-550 font-medium">Use o botão acima para cadastrar seu primeiro cartão e ter visibilidade do limite utilizado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => {
              const available = card.limit - card.used
              const percentUsed = card.limit > 0 
                ? Math.min(100, Math.round((card.used / card.limit) * 100)) 
                : 0

              const isSelected = selectedCard?.id === card.id

              // Categorize card colors organically for premium feels
              const colors = [
                'from-indigo-900 to-indigo-950 border-indigo-950 text-white',
                'from-slate-900 to-slate-950 border-slate-950 text-white',
                'from-violet-900 to-violet-950 border-violet-950 text-white',
              ]
              const bgClass = colors[card.name.toLowerCase().includes('nubank') ? 2 : card.name.toLowerCase().includes('itau') ? 0 : 1]

              return (
                <div 
                  key={card.id} 
                  onClick={() => {
                    setSelectedCard(card)
                    fetchInvoices(card.id)
                  }}
                  className={`bg-gradient-to-br ${bgClass} border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-48 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer ${
                    isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0B1220] scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  {/* Visual overlay chip ornament */}
                  <div className="absolute right-6 top-6 w-10 h-8 bg-white/10 border border-white/10 rounded-lg select-none pointer-events-none flex items-center justify-center">
                    <span className="w-6 h-5 bg-amber-400/85 rounded-sm" />
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Cartão de Crédito</span>
                    <h3 className="text-xl font-extrabold tracking-tight mt-1">{card.name}</h3>
                  </div>

                  {/* Limits and Progress details */}
                  <div className="space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Utilizado</span>
                        <span className="block font-mono font-bold text-sm tracking-tight">{formatCurrency(card.used)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Disponível</span>
                        <span className="block font-mono font-extrabold text-sm tracking-tight text-emerald-400">{formatCurrency(available)}</span>
                      </div>
                    </div>

                    {/* Progress limit bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] opacity-60 font-semibold font-mono">
                        <span>{percentUsed}% Limite Usado</span>
                        <span>Total: {formatCurrency(card.limit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions overlay hover bar */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md rounded-lg p-1 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEdit(card)
                      }}
                      className="p-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10 cursor-pointer"
                      title="Editar limites"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(card.id)
                      }}
                      className="p-1.5 text-red-300 hover:text-red-450 rounded-md hover:bg-white/10 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

        {/* Selected Card Invoices History Block */}
        {selectedCard && (
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Faturas e Histórico Mensal</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Exibindo faturas do cartão: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCard.name}</span></p>
              </div>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg font-mono shrink-0 self-start sm:self-center uppercase tracking-wider">
                Controle de Ciclo
              </span>
            </div>

            {invoicesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-400">Consultando histórico de faturas...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">Nenhum histórico de fatura disponível.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="py-3 px-4">Período</th>
                      <th className="py-3 px-4">Estado da Fatura</th>
                      <th className="py-3 px-4">Vencimento</th>
                      <th className="py-3 px-4 text-right">Valor da Fatura</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                    {invoices.map((inv, idx) => {
                      const monthNames = [
                        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                      ]
                      const periodText = `${monthNames[inv.month - 1]} / ${inv.year}`

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          {/* Period */}
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {periodText}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            {inv.status === 'OPEN' && (
                              <span className="flex items-center gap-1.5 font-bold text-xs text-blue-600 dark:text-blue-400">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span>Aberta (Mês Atual)</span>
                              </span>
                            )}
                            {inv.status === 'CLOSED' && (
                              <div className="space-y-1">
                                <span className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-500">
                                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                  <span>Fechada (Pendente)</span>
                                </span>
                                <p className="text-[10px] text-amber-800 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/25 border border-amber-100/50 dark:border-amber-900/15 p-2 rounded-lg font-semibold max-w-xs leading-normal">
                                  Sua fatura está fechada e precisa ser paga.
                                </p>
                              </div>
                            )}
                            {inv.status === 'PAID' && (
                              <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span>Paga</span>
                              </span>
                            )}
                          </td>

                          {/* Due Date */}
                          <td className="py-4 px-4 font-semibold text-slate-500 dark:text-slate-400">
                            {new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>

                          {/* Amount */}
                          <td className="py-4 px-4 font-mono font-bold text-right text-slate-700 dark:text-slate-350">
                            {formatCurrency(inv.amount)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center">
                            {inv.status === 'OPEN' && (
                              <button
                                onClick={() => handleCloseInvoice(inv.cardId, inv.year, inv.month)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg text-[10px] tracking-wide uppercase transition-all cursor-pointer shadow-sm shadow-amber-500/10"
                              >
                                Fechar Fatura
                              </button>
                            )}
                            {inv.status === 'CLOSED' && (
                              <button
                                onClick={() => handlePayInvoice(inv.cardId, inv.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-[10px] tracking-wide uppercase transition-all cursor-pointer shadow-sm shadow-emerald-500/10 animate-pulse"
                              >
                                Pagar Fatura
                              </button>
                            )}
                            {inv.status === 'PAID' && (
                              <span className="text-[10px] uppercase font-bold text-emerald-500/90 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/10 px-2.5 py-1 rounded-md">
                                Liquidada
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <ConfirmModal
          isOpen={!!deleteId}
          title="Excluir Cartão de Crédito"
          message="Tem certeza de que deseja remover este cartão? As despesas associadas continuarão existindo sem cartão no seu painel."
          onConfirm={async () => {
            if (deleteId) {
              setError('')
              setSuccess('')
              await cardService.delete(deleteId)
              setSuccess('Cartão excluído com sucesso!')
              await loadCards()
            }
          }}
          onClose={() => setDeleteId(null)}
        />

      </div>
    </Layout>
  )
}
