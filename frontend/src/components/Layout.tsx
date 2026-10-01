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
  Target
} from 'lucide-react'
import Logo from './Logo'
import authService from '../services/authService'
import userService from '../services/userService'
import OnboardingTutorial from './OnboardingTutorial'
import type { User } from '../types'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<User | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  
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
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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

    </div>
  )
}
