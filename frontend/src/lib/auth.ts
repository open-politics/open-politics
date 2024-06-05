import axios from 'axios';

const API_URL = 'http://localhost/api/v1';

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login/access-token`, {
    username: email,
    password: password,
  });
  return response.data;
};

export const signup = async (email: string, password: string, fullName: string) => {
  const response = await axios.post(`${API_URL}/users/open`, {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

export const getCurrentUser = async (token: string) => {
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
