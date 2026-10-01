import { useEffect, useState } from 'react'
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Check, 
  X,
  Lock,
  Search
} from 'lucide-react'
import Layout from '../../components/Layout'
import categoryService from '../../services/categoryService'
import ConfirmModal from '../../components/ConfirmModal'
import type { Category } from '../../types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Search input state
  const [searchTerm, setSearchTerm] = useState('')

  // Confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form states for creating
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await categoryService.findAll()
      setCategories(data)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar categorias. Verifique se o sistema está online.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      await categoryService.create(newCategoryName.trim())
      setNewCategoryName('')
      setSuccess('Sua nova categoria foi adicionada com sucesso!')
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao criar categoria.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveEdit = async (cat: Category) => {
    if (!editingName.trim() || editingName.trim() === cat.name) {
      handleCancelEdit()
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await categoryService.update(cat.id, editingName.trim())
      setSuccess('Categoria atualizada com sucesso!')
      setEditingId(null)
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar categoria.')
      setLoading(false)
    }
  }

  // Filter list by search term
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Categorias</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">
            Classifique seus gastos de forma simples. Suas categorias personalizadas são salvas em tempo real.
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create category workspace form */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm h-fit space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Nova Categoria</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Crie marcadores como "Mercado", "Salário" ou "Combustível".</p>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="text"
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                  placeholder="Ex: Transporte, Lazer..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !newCategoryName.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Salvar Categoria</span>
              </button>
            </form>
          </div>

          {/* List of categories grid */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* List Header with Search Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Minhas Categorias</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Categorias cadastradas para seus lançamentos.</p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-lg outline-none transition-all font-semibold text-slate-700 dark:text-slate-200 w-full sm:w-48"
                />
              </div>
            </div>

            {loading && categories.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Carregando lista...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs font-bold flex flex-col items-center justify-center gap-2">
                <Tag className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <span>Nenhuma categoria localizada.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCategories.map((cat) => {
                  const isEditing = editingId === cat.id
                  return (
                    <div key={cat.id} className="py-4 flex items-center justify-between text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors px-2 rounded-xl">
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full max-w-lg animate-fade-in">
                          <input
                            type="text"
                            maxLength={50}
                            required
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-[#1E293B] rounded-xl outline-none transition-all font-semibold text-slate-700 dark:text-slate-200"
                          />
                          <button
                            onClick={() => handleSaveEdit(cat)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors shrink-0 cursor-pointer"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <Tag className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{cat.name}</span>
                            {/* Zero-Pill unboxed static metadata rule */}
                            {cat.isDefault && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold font-mono tracking-wider uppercase flex items-center gap-1 select-none">
                                <span>·</span>
                                <span>Padrão</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-4 select-none">
                            {cat.isDefault ? (
                              <div className="p-2 text-slate-300 dark:text-slate-700" title="Categorias do sistema não podem ser modificadas">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/45 rounded-xl transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteId(cat.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/45 rounded-xl transition-colors cursor-pointer"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <ConfirmModal
            isOpen={!!deleteId}
            title="Excluir Categoria"
            message="Tem certeza que deseja excluir esta categoria? Lançamentos vinculados a ela também poderão ser afetados."
            onConfirm={async () => {
              if (deleteId) {
                setError('')
                setSuccess('')
                await categoryService.delete(deleteId)
                setSuccess('Categoria removida com sucesso!')
                fetchCategories()
              }
            }}
            onClose={() => setDeleteId(null)}
          />

        </div>

      </div>
    </Layout>
  )
}
