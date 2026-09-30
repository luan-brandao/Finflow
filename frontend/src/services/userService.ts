import { api } from './api'
import type { User, UserUpdateData, PaginatedUsers } from '../types'

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/users/me')
    return response.data
  },

  async updateMe(data: UserUpdateData): Promise<User> {
    const response = await api.put<User>('/api/users/me', data)
    return response.data
  },

  // Admin operations
  async getAllUsers(page = 0, size = 10): Promise<PaginatedUsers> {
    const response = await api.get<PaginatedUsers>(`/api/users?page=${page}&size=${size}&sort=name,asc`)
    return response.data
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/api/users/${id}`)
    return response.data
  },

  async updateUserByAdmin(id: string, data: UserUpdateData): Promise<User> {
    const response = await api.put<User>(`/api/users/${id}`, data)
    return response.data
  },

  async deleteUserByAdmin(id: string): Promise<void> {
    await api.delete(`/api/users/admin/${id}`)
  }
}

export default userService
