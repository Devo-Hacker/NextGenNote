import api from './axios';

export const getWhiteboards = () => api.get('/whiteboards');
export const getWhiteboardById = (id) => api.get(`/whiteboards/${id}`);
export const createWhiteboard = (data = {}) => api.post('/whiteboards', data);
export const updateWhiteboard = (id, data) => api.put(`/whiteboards/${id}`, data);
export const deleteWhiteboard = (id) => api.delete(`/whiteboards/${id}`);