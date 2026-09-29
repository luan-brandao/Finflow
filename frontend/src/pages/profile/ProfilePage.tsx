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
      setError('A senha deve conter no mínimo 8 caracteres.')
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
      setSuccess('Seu perfil foi atualizado com sucesso!')
      
      // Update local storage if needed or just reload state
      setName(updated.name)
      setEmail(updated.email)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao atualizar dados do perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in max-w-2xl">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
          <p className="text-sm text-slate-500 mt-1">Visualize suas informações de registro e atualize seus dados de cadastro.</p>
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

        {loading && !profile ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Obtendo dados cadastrais...</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 gap-8">
            
            {/* Profile Info Summary Card */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg uppercase select-none shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{profile.name}</h2>
                <p className="text-sm text-slate-500 truncate">{profile.email}</p>
                
                <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 mt-2 font-mono uppercase tracking-wider select-none">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Nível: {profile.role}</span>
                  </span>
                  {profile.created && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Cadastrado em: {new Date(profile.created).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Update Form */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alterar Informações</h3>
                <p className="text-xs text-slate-400 mt-1">Insira os novos dados cadastrais. Por questões de segurança, você deve definir uma senha para salvar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={70}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">E-mail</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Password confirmation/update */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Senha de Confirmação / Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={100}
                      placeholder="Mínimo 8 caracteres para confirmar/atualizar"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-lg outline-none transition-all text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Salvar Alterações</span>
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
