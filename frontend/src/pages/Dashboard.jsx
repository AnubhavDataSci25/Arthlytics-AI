import { BarChart, FileUp, MessageSquare, Users, TrendingUp, Sparkles, BarChart2, Loader2, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dashService } from '../services/dashService';

const FEATURES = [
    { icon: BarChart2, label: 'CleanStats', desc: 'Auto-clean + statistical analysis', href: '/cleanstats', color: 'bg-brand-500/10 text-brand-400' },
    { icon: TrendingUp, label: 'AutoViz', desc: 'AI-Powered chart generation', href: '/autoviz', color: 'bg-violet-500/10 text-violet-400' },
    { icon: MessageSquare, label: 'SmartQuery', desc: 'Chat with your data using AI', href: '/smartquery', color: 'bg-sky-500/10 text-sky-400' },
    { icon: Users, label: 'Workspace', desc: 'Real-time collaborative analytics', href: '/workspace', color: 'bg-amber-500/10 text-amber-400' },
]

function StatsCard({ icon: Icon, label, value, color, loading }){
    return (
        <div className='card flex items-center gap-4'>
            <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                <Icon className='w-4 h-4'/>
            </div>
            <div>
                {loading
                ? <div className='w-8 h-5 bg-white/5 rounded animate-pulse mb-0.5'/>
                : <p className='text-xl font-display font-bold text-zinc-100'>{value}</p>
            }
            <p className='text-xs text-zinc-500'>{label}</p>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const user = useAuthStore(s => s.user)
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashService.getStats,
        refetchOnWindowFocus: true,
        staleTime:1000*30,
    })

    const files = data?.files ??[]
    const projects = data?.projects ??[]

    // Compute metrics
    const totalRows = files.reduce((acc, f) => acc + (f.row_count ?? 0), 0)
    const members = projects.reduce((acc, p) => acc + (p.members?.length ?? 0), 0)
    const vizCount = parseInt(localStorage.getItem('viz_count') || '0')

    const STATS = [
        { label: 'File Uploaded', icon: FileUp, value: files.length, color: 'text-brand-400' },
        { label: 'Charts Generated', icon: BarChart, value: vizCount, color: 'text-violet-400' },
        { label: 'AI Queries', icon: MessageSquare, value: projects.length, color: 'text-sky-400' },
        { label: 'Workspace Members', icon: Users, value: members, color: 'text-amber-400' },
    ]

    // Recent files (last 3)
    const recentFiles = [...files]
        .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0,3)

    return (
        <div className='p-8 space-y-8 animate-fade-up'>
            {/* Header */}
            <div className='flex items-start justify-between'>
                <div>
                    <p className='text-xs text-zinc-500 font-display uppercase tracking-widest mb-1'>Welcome back</p>
                    <h1 className='text-2xl font-display font-bold text-zinc-100'>
                        {user?.username ?? 'User'} <span className='text-brand-400'>👋</span>
                    </h1>
                    <p className='text-sm text-zinc-400 mt-1'>Your AI analytics workspace is ready.</p>
                </div>
                <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20'>
                <Sparkles className='w-3.5 h-3.5 text-brand-400'/>
                <span className='text-xs font-display font-medium text-brand-400'>AI Ready</span>
                </div>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {STATS.map(s => <StatsCard key={s.label} {...s} loading={isLoading}/>)}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Features */}
                <div className='lg:col-span-2'>
                    <h2 className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4'>Features</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
                            <button
                                key={label}
                                onClick={() => navigate(href)}
                                className='card hover:border-white/10 hover:bg-surface-700 transition-all duration-200 flex items-start gap-4 group text-left'
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                    <Icon className='w-5 h-5'/>
                                </div>
                                <div>
                                    <p className='font-display font-semibold text-zinc-100 text-sm group-hover:text-brand-300 transition-colors'>{label}</p>
                                    <p className='text-xs text-zinc-500 mt-0.5'>{desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* {Recent files} */}
                <div>
                    <h2 className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4'>Recent Files</h2>
                    <div className='card p-0 overflow-hidden'>
                        {isLoading ? (
                            <div className='flex items-center justify-center py-10'>
                                <Loader2 className='w-5 h-5 text-brand-400 animate-spin'/>
                            </div>
                        ) : recentFiles.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-10 text-center px-4'>
                                <FileUp className='w-6 h-6 text-zinc-700 mb-2'/>
                                <p className='text-xs text-zinc-600'>No files yet. Upload in CleanStats.</p>
                                <button onClick={() => navigate('/cleanstats')} className='btn-primary text-xs mt-3 px-3 py-1.5'>
                                    Upload File
                                </button>
                            </div>
                        ) : (
                            <div className='divide-y divide-white/5'>
                                {recentFiles.map(f => (
                                    <div key={f.id} className='flex items-start gap-3 px-4 py-3 hover:bg-white/2 transition-all'>
                                        <div className='w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5'>
                                            <BarChart2 className='w-3.5 h-3.5 text-brand-400'/>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs font-medium text-zinc-200 truncate'>
                                                {f.col_count ?? '—'} cols
                                            </p>
                                        </div>
                                        <div className='flex items-center gap-1 text-zinc-700 shrink-0'>
                                            <Clock className='w-3 h-3' />
                                            <span className='text-xs'>
                                                {new Date(f.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => navigate('/cleanstats')}
                                    className='w-full text-xs text-zinc-600 hover:text-brand-400 py-2.5 transition-colors text-center'
                                >
                                    View all files →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
