import { api } from './api'
import type { Transaction, TransactionRequest } from '../types'

export const transactionService = {
  async findAll(): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>('/api/transactions')
    return response.data
  },

  async findById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/api/transactions/${id}`)
    return response.data
  },

  async create(data: TransactionRequest): Promise<Transaction> {
    const response = await api.post<Transaction>('/api/transactions', data)
    return response.data
  },

  async update(id: string, data: TransactionRequest): Promise<Transaction> {
    const response = await api.put<Transaction>(`/api/transactions/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/transactions/${id}`)
  }
}

export default transactionService
