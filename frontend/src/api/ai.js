import api from './axios';

export const generateAINote = (prompt, mood) =>
  api.post('/ai/generate', { prompt, mood });