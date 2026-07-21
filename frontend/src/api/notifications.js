import api from './axios';

export const getNotifications = () => api.get('/notifications');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const clearAllNotifications = () => api.delete('/notifications/clear');