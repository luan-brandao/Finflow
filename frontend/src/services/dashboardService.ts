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
    return response.data
  }
}

export default dashboardService
