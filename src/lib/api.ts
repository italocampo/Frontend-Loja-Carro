import axios, { type AxiosError } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Interceptor para anexar o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token e redirecionar ao login se falhar
let isRefreshing = false;
let failedRequestsQueue: { resolve: (value: unknown) => void; reject: (err: AxiosError) => void; }[] = [];

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Evita loop de redirecionamento se já estiver na página de login
    const isOnLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !originalRequest._retry && !isOnLoginPage) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          await api.post('/auth/refresh');

          failedRequestsQueue.forEach(request => request.resolve(api(originalRequest)));
          failedRequestsQueue = [];

          return api(originalRequest);
        } catch (refreshError) {
          failedRequestsQueue.forEach(request => request.reject(refreshError as AxiosError));
          failedRequestsQueue = [];
          
          console.error("Sessão expirada. Por favor, faça login novamente.");
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          resolve: (value) => resolve(value),
          reject: (err) => reject(err),
        });
      });
    }

    return Promise.reject(error);
  }
);