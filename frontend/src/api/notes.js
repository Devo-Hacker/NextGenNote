import api from './axios';

export const getNotes = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/notes?${query}`);
};
export const getNoteCounts = () => api.get('/notes/counts');
export const getNoteById = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const togglePinNote = (id) => api.patch(`/notes/${id}/pin`);
export const archiveNote = (id) => api.patch(`/notes/${id}/archive`);
export const restoreNote = (id) => api.patch(`/notes/${id}/restore`);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const hardDeleteNote = (id) => api.delete(`/notes/${id}/permanent`);
export const emptyTrash = () => api.delete('/notes/trash/empty');
export const getGraphData = () => api.get('/notes/graph/data');
export const toggleNoteLink = (noteId, targetId) => api.patch(`/notes/${noteId}/link`, { targetId });