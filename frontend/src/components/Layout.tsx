import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Tag, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Sun,
  Moon,
  Shield,
  Target,
  Bell,
  Trash2,
  CheckCheck,
  Inbox,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2
} from 'lucide-react'
import Logo from './Logo'
import authService from '../services/authService'
import userService from '../services/userService'
import notificationService from '../services/notificationService'
import OnboardingTutorial from './OnboardingTutorial'
import type { User } from '../types'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const fetchNotifications = async () => {
    if (!authService.isAuthenticated()) return
    try {
      const list = await notificationService.findAll()
      setNotifications(list)
      const count = await notificationService.countUnread()
      setUnreadCount(count)
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
    }
  }

  // Poll for notifications periodically
  useEffect(() => {
    if (profile) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
      return () => clearInterval(interval)
    }
  }, [profile])

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      await fetchNotifications()
    } catch (err) {
      console.error('Erro ao marcar como lida:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      await fetchNotifications()
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id)
      await fetchNotifications()
    } catch (err) {
      console.error('Erro ao deletar notificação:', err)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'SUCCESS': return CheckCircle2;
      case 'WARNING': return AlertTriangle;
      case 'URGENT': return AlertCircle;
      default: return Info;
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'SUCCESS': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'WARNING': 
        return 'bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'URGENT': 
        return 'bg-red-50 text-red-600 border-red-100/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      default: 
        return 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
             d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }
  
  // Theme state with instant client-safe initialization
  const [isDark, setIsDark] = useState(() => {
    const profileId = localStorage.getItem('finflow_last_user_id') || 'global';
    const saved = localStorage.getItem(`finflow_theme_${profileId}`);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    const profileId = profile ? profile.id : (localStorage.getItem('finflow_last_user_id') || 'global');
    localStorage.setItem(`finflow_theme_${profileId}`, isDark ? 'dark' : 'light');
  }, [isDark, profile])

  useEffect(() => {
    // Auth check
    if (!authService.isAuthenticated()) {
      navigate('/login')
      return
    }

    // Fetch own profile details
    userService.getMe()
      .then((data) => {
        setProfile(data)
        localStorage.setItem('finflow_last_user_id', data.id)
        
        // Check user-specific theme
        const savedUserTheme = localStorage.getItem(`finflow_theme_${data.id}`)
        if (savedUserTheme) {
          setIsDark(savedUserTheme === 'dark')
        }

        // Check if onboarding is completed for this user via backend field
        if (!data.onboardingCompleted) {
          setShowOnboarding(true)
        }
      })
      .catch(() => {
        // If JWT is expired or invalid, log out
        authService.logout()
        navigate('/login')
      })
  }, [navigate])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    if (location.pathname === '/dashboard') {
      window.location.reload()
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transações', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Categorias', path: '/categories', icon: Tag },
    { name: 'Cartões', path: '/cards', icon: CreditCard },
    { name: 'Metas', path: '/goals', icon: Target },
    { name: 'Perfil', path: '/profile', icon: UserIcon },
  ]

  if (profile?.role === 'ADMIN') {
    menuItems.push({ name: 'Admin', path: '/admin/users', icon: Shield })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] border-r border-slate-800 shrink-0 sticky top-0 h-screen text-slate-300">
        {/* Brand Area */}
        <div className="p-6 border-b border-slate-850 flex items-center">
          <Link to="/dashboard">
            <Logo className="w-8 h-8" showText={true} textSize="text-lg" textColor="text-white" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            const tourId = 'tour-nav-' + item.path.substring(1)
            return (
              <Link
                key={item.path}
                to={item.path}
                id={tourId}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          
          {/* Elegant Theme Switcher */}
          <div className="flex p-1 bg-slate-800/60 rounded-xl select-none text-slate-400">
            <button
              onClick={() => setIsDark(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${!isDark ? 'bg-slate-700 text-white shadow-sm' : 'hover:text-white'}`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Claro</span>
            </button>
            <button
              onClick={() => setIsDark(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isDark ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'}`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-200" />
              <span>Escuro</span>
            </button>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-all duration-200 w-full text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Notificações</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          {profile && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/40 border border-slate-800/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase select-none">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate leading-none">{profile.name}</p>
                <p className="text-[10px] text-slate-500 truncate mt-1 leading-none">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full text-left font-sans"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard">
          <Logo className="w-7 h-7" showText={true} textSize="text-md" textColor="text-white" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors relative cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0F172A] flex flex-col pt-20 text-slate-300">
          <nav className="flex-1 px-6 py-6 space-y-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t border-slate-800 flex flex-col gap-4 bg-slate-900/60">
            {profile && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none">
                  {profile.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-200 truncate leading-none">{profile.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-1.5 leading-none">{profile.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Page Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {showOnboarding && profile && (
        <OnboardingTutorial 
          userId={profile.id} 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {/* Slide-out Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300" 
              onClick={() => setIsNotificationsOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-300 ease-in-out">
                <div className="flex h-full flex-col bg-white dark:bg-[#1E293B] shadow-2xl border-l border-slate-150 dark:border-slate-800/60">
                  
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-md font-bold text-slate-900 dark:text-white">Central de Notificações</h2>
                    </div>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-850/60 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{unreadCount} não lidas de {notifications.length} total</span>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Marcar todas como lidas</span>
                      </button>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loadingNotifications ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-xs text-slate-400 font-medium">Buscando atualizações...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 border border-slate-100 dark:border-slate-800">
                          <Inbox className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma notificação</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">Você está totalmente em dia! Suas novidades financeiras e alertas aparecerão aqui.</p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const PriorityIcon = getPriorityIcon(n.priority)
                        const priorityColor = getPriorityColor(n.priority)
                        return (
                          <div 
                            key={n.id} 
                            onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group flex items-start gap-3.5 ${
                              n.isRead 
                                ? 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-850 opacity-80 hover:opacity-100' 
                                : 'bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/50 dark:border-indigo-900/30'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 border ${priorityColor}`}>
                              <PriorityIcon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-xs font-bold leading-none truncate ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-950 dark:text-white'}`}>
                                  {n.title}
                                </h3>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                                {n.content}
                              </p>
                              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mt-2">
                                {formatDate(n.createdAt)}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(n.id)
                              }}
                              className="absolute top-3.5 right-3.5 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Excluir notificação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
