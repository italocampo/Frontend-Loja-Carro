// Caminho: frontend/src/lib/api.ts

import axios, { type AxiosError } from 'axios';

/**
 * Instância principal do Axios para comunicação com a API.
 * 1. A baseURL agora inclui o prefixo /api/v1, garantindo que todas as
 * requisições atinjam o endpoint correto no backend.
 * 2. withCredentials: true é essencial para o envio automático de cookies
 * (como os de autenticação) em cada requisição.
 */
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true
});

// Lógica para controle de renovação de token, evitando chamadas múltiplas.
let isRefreshing = false;
let failedRequestsQueue: { resolve: (value: unknown) => void; reject: (err: AxiosError) => void; }[] = [];

/**
 * Interceptor de resposta do Axios.
 * Lida de forma inteligente com a expiração do token de acesso (erro 401).
 */
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const isOnLoginPage = window.location.pathname === '/login';

    // Apenas tenta renovar o token se o erro for 401 (Não Autorizado)
    // e se a requisição ainda não foi tentada novamente.
    if (error.response?.status === 401 && !originalRequest._retry && !isOnLoginPage) {
      
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Tenta renovar o token de acesso chamando a rota /auth/refresh.
          // A baseURL garante que a chamada seja para /api/v1/auth/refresh.
          await api.post('/auth/refresh');

          // Após renovar com sucesso, processa todas as requisições que falharam.
          failedRequestsQueue.forEach(request => request.resolve(api(originalRequest)));
          failedRequestsQueue = [];

          // Tenta novamente a requisição original que falhou.
          return api(originalRequest);

        } catch (refreshError) {
          // Se a renovação falhar, rejeita todas as requisições na fila
          // e redireciona o usuário para a página de login.
          failedRequestsQueue.forEach(request => request.reject(refreshError as AxiosError));
          failedRequestsQueue = [];
          
          console.error("Sessão expirada. Por favor, faça login novamente.");
          window.location.href = '/login';

          return Promise.reject(refreshError);

        } finally {
          isRefreshing = false;
        }
      }

      // Se um refresh já estiver em andamento, enfileira a requisição falha.
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