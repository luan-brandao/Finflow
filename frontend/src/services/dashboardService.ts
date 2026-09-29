import { api } from './api'
import type { DashboardResponse } from '../types'

export const dashboardService = {
  async getDashboard(startDate?: string, endDate?: string): Promise<DashboardResponse> {
    const params: Record<string, string> = {}
    if (startDate && endDate) {
      params.startDate = startDate
      params.endDate = endDate
    }
    const response = await api.get<DashboardResponse>('/api/dashboard', { params })
    const data = response.data
    if (data.cardsSummary) {
      data.cardsSummary = data.cardsSummary.map((card: any) => ({
        ...card,
        limit: card.creditLimit // Map creditLimit to limit for backward compatibility in UI
      }))
    }
    return data
  }
}

export default dashboardService
