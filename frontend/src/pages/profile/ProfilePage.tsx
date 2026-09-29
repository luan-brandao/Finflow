import { useEffect, useState } from 'react'
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Check, 
  ShieldAlert,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'
import Layout from '../../components/Layout'
import userService from '../../services/userService'
import type { User } from '../../types'

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await userService.getMe()
      setProfile(data)
      setName(data.name)
      setEmail(data.email)
    } catch (err: any) {
      console.error(err)
      setError('Erro ao obter os dados do perfil.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos os campos, incluindo a senha de confirmação, são obrigatórios.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve conter no mínimo 8 caracteres para atualizar com segurança.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const updated = await userService.updateMe({
        name: name.trim(),
        email: email.trim(),
        password: password
      })
      setProfile(updated)
      setPassword('')
      setSuccess('Seu cadastro pessoal foi atualizado com sucesso!')
      
      setName(updated.name)
      setEmail(updated.email)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar alterações no perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in max-w-2xl mx-auto">
        
        {/* Title */}
        <div className="border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Meu Cadastro</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Acompanhe suas credenciais pessoais e gerencie a segurança de acesso.</p>
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

        {loading && !profile ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500 font-medium">Carregando perfil pessoal...</p>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            
            {/* Info Card Layout */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl uppercase select-none shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="text-xl font-extrabold text-slate-900 truncate">{profile.name}</h2>
                <p className="text-sm text-slate-400 font-medium truncate mt-0.5">{profile.email}</p>
                
                {/* Micro unboxed metadata info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 mt-3 font-mono tracking-wider uppercase">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Nível: {profile.role}</span>
                  </span>
                  {profile.created && (
                    <span className="flex items-center gap-1">
                      <span>·</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Início: {new Date(profile.created).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Update Form Workspace */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alterar Informações Pessoais</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mantenha seu cadastro atualizado. Para salvar, é necessário fornecer sua senha atual ou uma nova senha de no mínimo 8 caracteres.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Name field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={70}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Endereço de E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Password confirmation / update */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Senha de Segurança / Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={100}
                      placeholder="Mínimo de 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirmar Alterações</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        ) : null}

      </div>
    </Layout>
  )
}
