import { api } from './api'
import type { Notification, UserNotificationPreference } from '../types'

export const notificationService = {
  async findAll(): Promise<Notification[]> {
    const response = await api.get<Notification[]>('/api/notifications')
    return response.data
  },

  async countUnread(): Promise<number> {
    const response = await api.get<number>('/api/notifications/unread/count')
    return response.data
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<Notification>(`/api/notifications/${id}/read`)
    return response.data
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/api/notifications/read-all')
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/notifications/${id}`)
  },

  async getPreferences(): Promise<UserNotificationPreference> {
    const response = await api.get<UserNotificationPreference>('/api/notifications/preferences')
    return response.data
  },

  async updatePreferences(preferences: Partial<UserNotificationPreference>): Promise<UserNotificationPreference> {
    const response = await api.put<UserNotificationPreference>('/api/notifications/preferences', preferences)
    return response.data
  }
}

export default notificationService
