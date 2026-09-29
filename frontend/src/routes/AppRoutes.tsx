import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import TransactionsPage from '../pages/transactions/TransactionsPage'
import CategoriesPage from '../pages/categories/CategoriesPage'
import ProfilePage from '../pages/profile/ProfilePage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default AppRoutes
