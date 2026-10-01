import { api } from './api'
import type { Goal, GoalRequest } from '../types'

export const goalService = {
  async findAll(): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/api/goals')
    return response.data
  },

  async findById(id: string): Promise<Goal> {
    const response = await api.get<Goal>(`/api/goals/${id}`)
    return response.data
  },

  async create(goal: GoalRequest): Promise<Goal> {
    const response = await api.post<Goal>('/api/goals', goal)
    return response.data
  },

  async update(id: string, goal: GoalRequest): Promise<Goal> {
    const response = await api.put<Goal>(`/api/goals/${id}`, goal)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/goals/${id}`)
  }
}

export default goalService
