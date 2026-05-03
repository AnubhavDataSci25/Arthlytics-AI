import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, BarChart2, MessageSquare, LineChart,
    Users, LogOut, ChevronRight, Sparkles
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import clsx from 'clsx';
import { use } from 'react';

const NAV = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cleanstats', icon: BarChart2, label: 'CleanStats' },
    { to: '/autoviz', icon: LineChart, label: 'AutoViz' },
    { to: '/smartquery', icon: MessageSquare, label: 'SmartQuery' },
    { to: '/workspace', icon: Users, label: 'Workspace' },
]

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className='flex h-screen overflow-hidden bg-surface-900'>
            {/* Sidebar */}
            <aside className='w-60 flex flex-col border-r border-white/5 bg-surface-800 shrink-0'>
                {/* Logo */}
                <div className='flex items-center gap-2.5 px-5 py-5 border-b border-white/5'>
                    <div className='w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center'>
                        <Sparkles className='w-4 h-4 text-brand-400'/>
                    </div>
                    <span className='font-display font-bold text-base text-zinc-100 tracking-tight'>
                        Arthlytics <span className='text-brand-400'>AI</span>
                    </span>
                </div>

                {/* Navigation */}
                <nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin'>
                    {NAV.map(({ to, icon: Icon, label }) => (
                        <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => 
                            clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150 group',
                                isActive
                                    ? 'bg-brand-500/15 text-brand-400 font-medium'
                                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                            )
                        }
                        >
                            {({ isActive }) => (
                                <>
                                <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-brand-400':'text-zinc-500 group-hover:text-zinc-300')}/>
                                    <span className='flex-1'>{label}</span>
                                    {isActive && <ChevronRight className='w-3 h-3 text-brand-500'/>}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className='px-3 py-4 border-t border-white/5'>
                    <div className='flex items-center gap-3 px-3 py-2.5 rounded-lg'>
                        <div className='w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0'>
                            <span className='text-xs font-display font-bold text-brand-400'>
                                {user?.username?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs font-medium text-zinc-200 truncate'>{user?.username ?? 'User'}</p>
                            <p className='text-xs text-zinc-500 truncate'>{user?.email ?? ''}</p>
                        </div>
                        <button onClick={handleLogout} className='text-zinc-500 hover:text-red-400 transition-colors' title='Logout'>
                            <LogOut className='w-4 h-4'/>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className='flex-1 overflow-y-auto scrollbar-thin'>
                <Outlet />
            </main>
        </div>
    )
}