import api from './axios';

export const getSupportedLanguages = () => api.get('/devmode/languages');
export const getSnippets = () => api.get('/devmode');
export const getSnippetById = (id) => api.get(`/devmode/${id}`);
export const createSnippet = (data) => api.post('/devmode', data);
export const updateSnippet = (id, data) => api.put(`/devmode/${id}`, data);
export const deleteSnippet = (id) => api.delete(`/devmode/${id}`);

export const detectLanguage = (code) => api.post('/devmode/detect-language', { code });
export const translateCode = (code, fromLanguage, toLanguage) =>
  api.post('/devmode/translate', { code, fromLanguage, toLanguage });
export const generateDiagram = (code, language) =>
  api.post('/devmode/diagram', { code, language });