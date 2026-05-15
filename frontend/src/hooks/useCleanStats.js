import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import { cleanService } from '@/services/cleanService'
import toast from 'react-hot-toast'

// Files
export function useFiles(){
    return useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const {data} = await cleanService.listFiles()
            return data
        },
    })
}

export function useUploadFile() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (file) => cleanService.upload(file),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['files']})
            toast.success('File uploaded successfully')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Upload failed'),
    })
}

export function useDeleteFile() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => cleanService.deleteFile(id),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['files']})
            toast.success('File deleted')
        },
        onError: () => toast.error('Delete failed'),
    })
}

// Stats
export function useStats(fileId, enabled=true) {
    return useQuery({
        queryKey: ['stats', fileId],
        queryFn: async () => {
            const {data} = await cleanService.getStats(fileId)
            return data
        },
        enabled: !!fileId && enabled,
    })
}

export function useCleanStatsMutation() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({id, options}) => cleanService.getCleanStats(id, options),
        onSuccess: (res, {id}) => {
            qc.setQueryData(['cleanstats', id], res.data)
            toast.success('Cleaning complete')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Cleaning failed'),
    })
}