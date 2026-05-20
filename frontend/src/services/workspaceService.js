import api from './api'

export const workspaceService = {
    // Projects
    list: () => api.get('/api/projects'),
    create: (data) => api.post('/api/projects', data),
    get: (id) => api.get(`/api/projects/${id}`),
    delete: (id) => api.delete(`/api/projects/${id}`),
    join: (invite_code) => api.post('/api/projects/join', {invite_code}),
    leave: (id) => api.delete(`/api/projects/${id}/leave`),

    // Members
    updateRole: (pid, uid, role) => api.patch(`/api/projects/${pid}/members/${uid}`, {role}),
    removeMember: (pid, uid) => api.delete(`/api/projects/${pid}/members/${uid}`),

    // Messages
    getMessages: (id, limit=50) => api.get(`/api/projects/${id}/messages`, {params: {limit}}),
}