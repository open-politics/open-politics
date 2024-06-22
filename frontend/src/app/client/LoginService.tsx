import axios from 'axios';

const API_URL = 'http://localhost/api/v1';

export const LoginService = {
  loginAccessToken: async ({ formData }: { formData: { username: string; password: string; grant_type: string } }) => {
    const response = await axios.post(`${API_URL}/login/access-token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};