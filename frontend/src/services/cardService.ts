import { api } from './api'
import type { Card } from '../types'

export const cardService = {
  async findAll(): Promise<Card[]> {
    const response = await api.get<any[]>('/api/cards')
    return response.data.map(item => ({
      ...item,
      limit: item.creditLimit // Map creditLimit to limit for backward compatibility in UI
    }))
  },

  async findById(id: string): Promise<Card> {
    const response = await api.get<any>(`/api/cards/${id}`)
    return {
      ...response.data,
      limit: response.data.creditLimit
    }
  },

  async create(card: { name: string; creditLimit: number }): Promise<Card> {
    const response = await api.post<any>('/api/cards', card)
    return {
      ...response.data,
      limit: response.data.creditLimit
    }
  },

  async update(id: string, card: { name: string; creditLimit: number }): Promise<Card> {
    const response = await api.put<any>(`/api/cards/${id}`, card)
    return {
      ...response.data,
      limit: response.data.creditLimit
    }
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/cards/${id}`)
  }
}

export default cardService
