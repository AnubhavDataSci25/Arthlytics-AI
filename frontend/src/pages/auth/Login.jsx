import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
    const [form, setForm] = useState({email: '', password: '' });
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore(s => s.setAuth);
    const navigate = useNavigate();

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const {data} = await authService.login(form)
            setAuth(data.access_token, data.user)
            toast.success(`Welcome back, ${data.user.username}!`)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail ?? 'Login Failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-surface-900 flex items-center justify-center p-4'>
            {/* Glow */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl'></div>

                <div className='w-full max-w-sm relative animate-fade-up'>
                    {/* Logo */}
                    <div className='flex items-center justify-center gap-2 mb-8'>
                        <div className='w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center'>
                            <Sparkles className='w-5 h-5 text-brand-400'/>
                        </div>
                        <span className='font-display font-bold text-xl text-zinc-100'>
                            Arthlytics <span className='text-brand-400'>AI</span>
                        </span>
                    </div>

                    {/* Card */}
                    <div className='card space-y-5'>
                        <div>
                            <h1 className='font-display font-bold text-lg text-zinc-100'>Sign in</h1>
                            <p className='text-xs text-zinc-500 mt-0.5'>Enter credentials to continue</p>
                        </div>

                        <form onSubmit={submit} className='space-y-4'>
                            <div>
                                <label className='label'>Email</label>
                                <input
                                    name='email' type='email' required
                                    placeholder='you@example.com'
                                    className='input'
                                    value={form.email}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className='label'>Password</label>
                                <div className='relative'>
                                    <input 
                                        name='password' type={show ? 'text' : 'password'} required
                                        placeholder='••••••••'
                                        className='input pr-10'
                                        value={form.password} onChange={handle}
                                    />
                                    <button
                                        type='button'
                                        onClick={() => setShow(p => !p)}
                                        className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300'
                                    >
                                        {show ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4'/>}
                                    </button>
                                </div>
                            </div>

                            <button type='submit' disabled={loading} className='btn-primary w-full flex items-center justify-center gap-2'>
                                {loading && <Loader2 className='w-4 h-4 animate-spin' />}
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <p className='text-xs text-zinc-500 text-center'>
                            No account?{' '}
                            <Link to='/register' className='text-brand-400 hover:text-brand-300 font-medium'>
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}