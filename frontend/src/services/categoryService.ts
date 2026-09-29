import { api } from './api'
import type { Category } from '../types'

export const categoryService = {
  async findAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/categories')
    return response.data
  },

  async findById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/api/categories/${id}`)
    return response.data
  },

  async create(name: string): Promise<Category> {
    const response = await api.post<Category>('/api/categories', { name })
    return response.data
  },

  async update(id: string, name: string): Promise<Category> {
    const response = await api.put<Category>(`/api/categories/${id}`, { name })
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/categories/${id}`)
  }
}

export default categoryService
