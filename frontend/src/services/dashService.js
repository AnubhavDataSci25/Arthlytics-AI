import api from './api'

export const dashService = {
    getStats: async () => {
        const [files, projects] = await Promise.all([
            api.get('/api/upload'),
            api.get('/api/projects'),
        ])
        return {
            files: files.data,
            projects: projects.data,
        }
    },
}