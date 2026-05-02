import api from "./api";

export const authService = {
    register: (date) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
}