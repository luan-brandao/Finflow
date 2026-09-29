import { api } from './api'
import type { MonthlyIncome } from '../types'

export const monthlyIncomeService = {
  async createOrUpdate(income: { year: number; month: number; amount: number }): Promise<MonthlyIncome> {
    const response = await api.put<MonthlyIncome>('/api/monthly-income', income)
    return response.data
  },

  async findCurrentMonthIncome(): Promise<MonthlyIncome> {
    const response = await api.get<MonthlyIncome>('/api/monthly-income')
    return response.data
  },

  async findByYearAndMonth(year: number, month: number): Promise<MonthlyIncome> {
    const response = await api.get<MonthlyIncome>(`/api/monthly-income/${year}/${month}`)
    return response.data
  },

  async findAll(): Promise<MonthlyIncome[]> {
    const response = await api.get<MonthlyIncome[]>('/api/monthly-income/history')
    return response.data
  },

  async deleteByYearAndMonth(year: number, month: number): Promise<void> {
    await api.delete(`/api/monthly-income/${year}/${month}`)
  }
}

export default monthlyIncomeService
