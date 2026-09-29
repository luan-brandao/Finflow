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
  Lock
} from 'lucide-react'
import Layout from '../../components/Layout'
import categoryService from '../../services/categoryService'
import type { Category } from '../../types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setSuccess('Categoria criada com sucesso!')
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Todas as transações vinculadas a ela também poderão ser afetadas.')) {
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await categoryService.delete(id)
      setSuccess('Categoria excluída com sucesso!')
      fetchCategories()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Não é possível excluir esta categoria pois ela possui transações vinculadas.')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categorias</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie suas categorias personalizadas de receitas e despesas.</p>
        </div>

        {/* Notifications */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Create form */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Nova Categoria</h3>
            <p className="text-xs text-slate-400">Insira um nome curto e objetivo para classificar seus lançamentos.</p>
            
            <form onSubmit={handleCreate} className="space-y-3 pt-2">
              <input
                type="text"
                maxLength={50}
                required
                disabled={isSubmitting}
                placeholder="Ex: Combustível, Salário, Lazer"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newCategoryName.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Criar Categoria</span>
              </button>
            </form>
          </div>

          {/* List of categories */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Minhas Categorias</h3>
            
            {loading && categories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Buscando categorias...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                Nenhuma categoria cadastrada. Crie uma para começar a registrar transações.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id
                  return (
                    <div key={cat.id} className="py-3.5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors px-2 rounded-lg">
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            maxLength={50}
                            required
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all"
                          />
                          <button
                            onClick={() => handleSaveEdit(cat)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <Tag className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                            {cat.isDefault && (
                              <span className="text-[10px] bg-slate-100 text-slate-400 font-mono font-semibold px-1.5 py-0.5 rounded uppercase select-none">
                                Padrão
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-4">
                            {cat.isDefault ? (
                              <div className="p-1.5 text-slate-300" title="Categorias padrão do sistema não podem ser alteradas">
                                <Lock className="w-4 h-4" />
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(cat.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
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

        </div>

      </div>
    </Layout>
  )
}
