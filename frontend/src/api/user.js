import api from './axios';

export const getMe = () => api.get('/user/me');
export const updateSettings = (data) => api.patch('/user/settings', data);