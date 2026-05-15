import { Flashlight } from 'lucide-react'
import api from './api'

export const cleanService = {
    // Upload file
    upload: (file) => {
        const fd = new FormData()
        fd.append('file', file)
        return api.post('/api/upload', fd, {
            headers: {'Content-Type': 'multipart/form-data'},
        })
    },

    // List uploaded files
    listFiles: () => api.get('/api/upload'),

    // Delete file
    deleteFile: (id) => api.delete(`/api/upload/${id}`),

    // Basic stats
    getStats: (id) => api.get(`/api/stats/${id}`),

    // Full clean + optional insights
    getCleanStats: (id, {removeOutliers=false, insights=false} = {}) =>
        api.get(`/api/stats/${id}`, {
            params: {clean: true, remove_outliers: removeOutliers, insights},
        }),
    
    // Download cleaned file
    downloadCleaned: (id, filename) => 
        api.get(`/api/stats/${id}/download-cleaned`, {
            params: {filename},
            responseType: 'blob',
        }),
}