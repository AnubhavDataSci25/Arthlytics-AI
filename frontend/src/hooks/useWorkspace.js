import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { workspaceService } from '@/services/workspaceService';
import toast from 'react-hot-toast';

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async() => {
            const {data} = await workspaceService.list()
            return data
        },
    })
}

export function useCreateProject(){
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (data) => workspaceService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['projects']})
            toast.success('Project created')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Create failed'),
    })
}

export function useJoinProject(){
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (code) => workspaceService.join(code),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['projects']})
            toast.success('Joined project')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Invalid invite code'),
    })
}

export function useDeleteProject(){
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => workspaceService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['projects']})
            toast.success('Project deleted')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Delete failed'),
    })
}

export function useLeaveProject(){
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => workspaceService.leave(id),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ['projects']})
            toast.success('Left project')
        },
        onError: (err) => toast.error(err.response?.data?.detail ?? 'Leave failed'),
    })
}

export function useMessages(projectId){
    return useQuery({
        queryKey: ['messages', projectId],
        queryFn: async () => {
            const {data} = await workspaceService.getMessages(projectId)
            return data
        },
        enabled: !!projectId,
        refetchInterval: false,
    })
}