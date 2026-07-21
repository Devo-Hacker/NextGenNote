import api from './axios';

export const getCollections = () => api.get('/collections');
export const createCollection = (data) => api.post('/collections', data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);
export const setNoteCollection = (noteId, collectionId) =>
  api.patch(`/notes/${noteId}/collection`, { collectionId });