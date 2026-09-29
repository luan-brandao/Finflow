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

  // Load cards from API
  const loadCards = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await cardService.findAll()
      setCards(data)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar seus cartões de crédito.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setName('')
    setLimit('')
    setIsFormOpen(true)
    setError('')
    setSuccess('')
  }

  const handleOpenEdit = (card: Card) => {
    setEditingId(card.id)
    setName(card.name)
    setLimit(card.limit.toString())
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

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      if (editingId) {
        await cardService.update(editingId, {
          name: name.trim(),
          creditLimit: numericLimit
        })
        setSuccess('Cartão de crédito atualizado com sucesso!')
      } else {
        await cardService.create({
          name: name.trim(),
          creditLimit: numericLimit
        })
        setSuccess('Novo cartão de crédito cadastrado com sucesso!')
      }

      setIsFormOpen(false)
      await loadCards()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar o cartão de crédito.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // handleDelete is replaced by ConfirmModal inline action

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Cartões de Crédito</h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">Cadastre e gerencie seus cartões e controle o limite disponível.</p>
          </div>
          
          <button
            onClick={handleOpenCreate}
            className="self-start px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cartão</span>
          </button>
        </div>

        {/* Backend Sincronizado Indicator */}
        <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
          <Wallet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 font-semibold leading-relaxed">
            <span className="block font-bold">Ambiente Conectado</span>
            <span className="block font-normal mt-0.5">
              Sua carteira de cartões está totalmente conectada em tempo real ao backend do Finflow. Os limites utilizados são calculados automaticamente de forma segura com base nos lançamentos efetuados.
            </span>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100/85 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100/85 rounded-xl flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold text-emerald-700">{success}</span>
          </div>
        )}

        {/* Edit / Create Form overlay section */}
        {isFormOpen && (
          <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {editingId ? 'Editar Limites do Cartão' : 'Cadastrar Cartão de Crédito'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              
              {/* Card Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nome do Cartão (Instituição)</label>
                <input
                  type="text"
                  maxLength={50}
                  required
                  placeholder="Ex: Nubank, Itaú, Inter..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none transition-all font-semibold text-slate-700"
                />
              </div>

              {/* Total Limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Limite de Crédito Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ex: 5000"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl outline-none transition-all font-mono font-bold text-slate-700"
                />
              </div>

              {/* Actions */}
              <div className="sm:col-span-2 flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
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
            <p className="text-sm font-semibold text-slate-500">Buscando seus cartões de crédito...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            <CreditCard className="w-12 h-10 text-slate-300" />
            <p className="text-sm font-bold">Nenhum cartão cadastrado.</p>
            <p className="text-xs max-w-xs leading-relaxed text-slate-400 font-medium">Use o botão acima para cadastrar seu primeiro cartão e ter visibilidade do limite utilizado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => {
              const available = card.limit - card.used
              const percentUsed = card.limit > 0 
                ? Math.min(100, Math.round((card.used / card.limit) * 100)) 
                : 0

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
                  className={`bg-gradient-to-br ${bgClass} border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-48 hover:shadow-md transition-all relative overflow-hidden group`}
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
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md rounded-lg p-1">
                    <button
                      onClick={() => handleOpenEdit(card)}
                      className="p-1.5 text-white/80 hover:text-white rounded-md hover:bg-white/10"
                      title="Editar limites"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(card.id)}
                      className="p-1.5 text-red-300 hover:text-red-400 rounded-md hover:bg-white/10"
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
