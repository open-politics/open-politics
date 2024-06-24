// api/auth.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // This will be rewritten to your FastAPI server
});

export const loginAccessToken = async (username: string, password: string) => {
  const response = await api.post('/login/access-token', {
    username,
    password,
  });
  return response.data;
};
