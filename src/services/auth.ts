import api from "../utils/axios";


export const getCsrfCookie = async () => {
  try {
    // We use an absolute URL to bypass the /api baseURL
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
    await api.get(`${baseUrl}/sanctum/csrf-cookie`);
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

export interface LoginData {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
    message: string;
    user: LoginData;
}