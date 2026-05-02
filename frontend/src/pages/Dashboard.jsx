import { BarChart, FileUp, MessageSquare, Users, TrendingUp, Sparkles, BarChart2 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const STATS = [
    { label: 'File Uploaded', icon: FileUp, value: '-', color: 'text-brand-400' },
    { label: 'Charts Generated', icon: BarChart, value: '-', color: 'text-violet-400' },
    { label: 'AI Queries', icon: MessageSquare, value: '-', color: 'text-sky-400' },
    { label: 'Workspace Members', icon: Users, value: '-', color: 'text-amber-400' },
]

const FEATURES = [
    { icon: BarChart2, label: 'CleanStats', desc: 'Auto-clean + statistical analysis', href: '/cleanstats', color: 'bg-brand-500/10 text-brand-400' },
    { icon: TrendingUp, label: 'AutoViz', desc: 'AI-Powered chart generation', href: '/autoviz', color: 'bg-violet-500/10 text-violet-400' },
    { icon: MessageSquare, label: 'SmartQuery', desc: 'Chat with your data using AI', href: '/smartquery', color: 'bg-sky-500/10 text-sky-400' },
    { icon: Users, label: 'Workspace', desc: 'Real-time collaborative analytics', href: '/workspace', color: 'bg-amber-500/10 text-amber-400' },
]

export default function Dashboard() {
    const user = useAuthStore(s => s.user)

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
                {STATS.map(({ label, icon: Icon, value, color }) => (
                    <div key={label} className='card flex items-center gap-4'>
                        <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className='w-4 h-4'/>
                        </div>
                        <div>
                            <p className='text-xl font-display font-bold text-zinc-100'>{value}</p>
                            <p className='text-xs text-zinc-500'>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Features */}
            <div>
                <h2 className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4'>Features</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
                        <a
                        key={label}
                        href={href}
                        className='card hover:border-white/10 hover:bg-surface-700 transition-all duration-200 flex items-start gap-4 group'>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                            <Icon className='w-5 h-5'/>
                        </div>
                        <div>
                            <p className="font-display font-semibold text-zinc-100 text-sm group-hover:text-brand-300 transition-colors">{label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                        </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}