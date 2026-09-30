import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Loader2, 
  Trash2, 
  Edit2, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  X, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Lock, 
  Shield
} from 'lucide-react'
import Layout from '../components/Layout'
import userService from '../services/userService'
import ConfirmModal from '../components/ConfirmModal'
import type { User, PaginatedUsers } from '../types'

export default function AdminUsersPage() {
  const [paginated, setPaginated] = useState<PaginatedUsers | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Details Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Edit Modal state
  const [editUser, setEditUser] = useState<User | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editError, setEditError] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  // Delete Modal state
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    // Phase 1: Security validation
    userService.getMe()
      .then((data) => {
        if (data.role === 'ADMIN') {
          setIsAdmin(true)
          setCheckingAdmin(false)
          fetchUsers(0)
        } else {
          // Access Denied: redirect standard users away from admin dashboard
          navigate('/dashboard')
        }
      })
      .catch((err) => {
        console.error(err)
        navigate('/login')
      })
  }, [navigate])

  const fetchUsers = async (page: number) => {
    setLoading(true)
    setError('')
    try {
      const data = await userService.getAllUsers(page, 8)
      setPaginated(data)
      setCurrentPage(page)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao carregar lista de usuários da plataforma.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    
    if (!editName.trim()) {
      setEditError('O nome é obrigatório.')
      return
    }
    if (!editEmail.trim()) {
      setEditError('O e-mail é obrigatório.')
      return
    }
    if (!editPassword || editPassword.length < 8) {
      setEditError('A senha é obrigatória e deve conter ao menos 8 caracteres para atualizar o usuário.')
      return
    }

    setEditLoading(true)
    setEditError('')
    try {
      await userService.updateUserByAdmin(editUser.id, {
        name: editName,
        email: editEmail,
        password: editPassword
      })
      setSuccess(`Usuário "${editName}" atualizado com sucesso!`)
      setIsEditOpen(false)
      fetchUsers(currentPage)
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || 'Erro ao atualizar dados do usuário.'
      setEditError(msg)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return
    try {
      await userService.deleteUserByAdmin(deleteUser.id)
      setSuccess(`Usuário "${deleteUser.name}" excluído com sucesso!`)
      fetchUsers(currentPage)
      
      // Auto clear success message
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.message || 'Erro ao excluir usuário.'
      setError(msg)
      throw err // Let the ConfirmModal catch/display error
    }
  }

  const openDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditPassword('')
    setEditError('')
    setIsEditOpen(true)
  }

  const openDelete = (user: User) => {
    setDeleteUser(user)
    setIsDeleteOpen(true)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Verificando credenciais administrativas...</p>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Painel de Administração</span>
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">
              Controle de usuários cadastrados e governança da plataforma Finflow.
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100/80 dark:border-red-900/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{success}</span>
          </div>
        )}

        {/* User Listing Section */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Usuários Registrados</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">
              Total: {paginated?.totalElements || 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Buscando lista de usuários...</p>
              </div>
            ) : !paginated || paginated.content.length === 0 ? (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                <UserIcon className="w-10 h-10" />
                <p className="font-bold text-xs">Nenhum usuário cadastrado.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                    <th className="p-4 pl-6">Nome</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Cargo / Nível</th>
                    <th className="p-4">Cadastro</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paginated.content.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-semibold">{user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20' 
                            : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20'
                        }`}>
                          {user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'CLIENTE'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 dark:text-slate-500">{formatDate(user.created)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(user)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            title="Visualizar detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                            title="Editar usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(user)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all cursor-pointer"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {paginated && paginated.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold font-mono">
                Página {paginated.number + 1} de {paginated.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={paginated.first || loading}
                  onClick={() => fetchUsers(currentPage - 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={paginated.last || loading}
                  onClick={() => fetchUsers(currentPage + 1)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 1. Modal: Details View */}
      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>Ficha do Usuário</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base uppercase">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{selectedUser.name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono uppercase">{selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo</span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nível de Permissão</span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedUser.role === 'ADMIN' ? 'Administrador (ROLE_ADMIN)' : 'Cliente (ROLE_USER)'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data de Criação</span>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
                      <span>{formatDate(selectedUser.created).split(',')[0]}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Última Atualização</span>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
                      <span>{formatDate(selectedUser.updated).split(',')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Form */}
      {isEditOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500" />
                <span>Editar Dados Cadastrais</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400">
                  {editError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-750 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-750 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nova Senha de Acesso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 8 caracteres para autorizar"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-750 dark:text-slate-200"
                  />
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">
                  * Por motivos de segurança do backend, preencha uma nova senha válida com pelo menos 8 dígitos para aplicar as alterações.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {editLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Confirmation of deletion */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Excluir Conta do Usuário"
        message={`Você tem certeza que deseja excluir o usuário "${deleteUser?.name}" (${deleteUser?.email}) permanentemente? Esta ação removerá o acesso do usuário à plataforma e é irreversível.`}
        confirmText="Excluir permanentemente"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeleteUser(null)
        }}
      />
    </Layout>
  )
}
