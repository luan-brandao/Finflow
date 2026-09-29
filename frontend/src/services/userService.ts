import { api } from './api'
import type { User, UserUpdateData } from '../types'

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/users/me')
    return response.data
  },

  async updateMe(data: UserUpdateData): Promise<User> {
    const response = await api.put<User>('/api/users/me', data)
    return response.data
  }
}

export default userService
