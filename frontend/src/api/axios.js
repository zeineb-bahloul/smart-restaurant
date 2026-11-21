import axios from 'axios';

// Creation de l'instance Axios
// Note: Configuré sur le port 2626 pour correspondre à votre backend Spring Boot
const api = axios.create({
  baseURL: 'http://localhost:2626/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token de sécurité à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses globales (ex: redirection si token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Déconnexion de l'utilisateur et redirection vers /login en cas de 401 (Non autorisé)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
