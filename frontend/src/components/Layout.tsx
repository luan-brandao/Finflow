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
  CreditCard
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
  const location = useLocation()
  const navigate = useNavigate()

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
        // Check if onboarding is completed for this user
        const completed = localStorage.getItem(`finflow_onboarding_completed_${data.id}`)
        if (completed !== 'true') {
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
    { name: 'Perfil', path: '/profile', icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen">
        {/* Brand Area */}
        <div className="p-6 border-b border-slate-100 flex items-center">
          <Link to="/dashboard">
            <Logo className="w-8 h-8" showText={true} textSize="text-lg" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
          {profile && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase select-none">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate leading-none">{profile.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-1 leading-none">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full text-left font-sans"
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-500" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/dashboard">
          <Logo className="w-7 h-7" showText={true} textSize="text-md" />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col pt-20">
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
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t border-slate-100 flex flex-col gap-4 bg-slate-50">
            {profile && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none">
                  {profile.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{profile.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 w-full"
            >
              <LogOut className="w-4 h-4 text-red-500" />
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
