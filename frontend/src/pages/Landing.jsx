import { useNavigate } from 'react-router-dom';
import {
    Sparkles, BarChart2, MessageSquare, LineChart, Users,
    ArrowRight, Upload, Wand2, Bot, Share2, Github, FileText,
    ChevronDown, Zap, Shield, TrendingUp,
    ColumnsIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Scroll animation hook
function useReveal() {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setVisible(true) },
            { threshold: 0.1}
        )
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [])
    return [ref, visible]
}

function Reveal({ children, delay=0, className=''}) {
    const [ref, visible] = useReveal()
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${className}`}
            style={{
                opacity: visible ? 1:0,
                transform: visible ? 'translateY(0)':'translateY(24px)',
                transitionDelay: `${delay}ms`,
            }}>
            {children}
        </div>
    )
}

// Data
const FEATURES = [
    {
        icon: BarChart2, label: 'CleanStats', color: 'text-brand-400 bg-brand-500/10',
        desc: 'Auto-clean datasets, fill missing values, detect outliers, and generate humanized statistical insights powered by LLM.'
    },
    {
        icon: LineChart, label: 'AutoViz', color: 'text-violet-400 bg-violet-500/10',
        desc: 'Describe a chart in plain English. AI picks the right visualization and renders it instantly - no code, no config.'
    },
    {
        icon: MessageSquare, label: 'SmartQuery', color: 'text-sky-400 bg-sky-500/10',
        desc: 'Chat with your CSV or Excel file. SQL Agent translated natural language to precise queries and returns accurate answers.'
    },
    {
        icon: Users, label: 'Workspace', color: 'text-amber-400 bg-amber-500/10',
        desc: 'Create shared projects, invite teammates, collaborate in real-time with WebSocket-powered chat and shared datasets.'
    },
]

const WORKFLOW = [
    {icon: Upload, label: 'Upload', desc: 'CSV or Excel'},
    {icon: Wand2, label: 'Clean', desc: 'Auto Preprocessing'},
    {icon: LineChart, label: 'Visualize', desc: 'AI Chart Generation'},
    {icon: Bot, label: 'Ask AI', desc: 'SQL-Powered Chat'},
    {icon: Share2, label: 'Collaborate', desc: 'Real-time workspace'},
]

const STATS = [
    {icon: Zap, val: '< 1s', label: 'Query Response'},
    {icon: Shield, val: '100%', label: 'Secure isolation'},
    {icon: TrendingUp, val: '5500+', label: 'Rows handled'},
]

// Navbar
function Navbar({ onNav }) {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', fn)
        return () => window.removeEventListener('scroll', fn)
    }, [])
    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface-900/90 backdrop-blur border-b border-white/5' : ''}`}>
            <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center'>
                        <Sparkles className='w-3.5 h-3.5 text-brand-400'/>
                    </div>
                    <span className='font-display font-bold text-zinc-100'>
                        Arthlytics <span className='text-brand-400'>AI</span>
                    </span>
                </div>
                <div className='flex items-center gap-3'>
                    <button onClick={() => onNav('/docs')} className='btn-ghost text-xs'>Docs</button>
                    <button onClick={() => onNav('/login')} className='btn-ghost text-xs'>Sign in</button>
                    <button onClick={() => onNav('/register')} className='btn-primary text-xs px-4 py-2'>Get Started</button>
                </div>
            </div>
        </nav>
    )
}

// Main
export default function Landing() {
    const navigate = useNavigate()
    const heroRef = useRef(null)

    const scrollDown = () => {
        heroRef.current?.nextElementSibling?.scrollIntoView({behavior:'smooth'})
    }

    return (
        <div className='min-h-screen bg-surface-900 text-zinc-100 scroll-smooth'>
            <Navbar onNav={navigate}/>

            {/* Hero */}
            <section ref={heroRef} className='relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20'>
                {/* Glows */}
                <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/8 rounded-full blur-3xl'/>
                    <div className='absolute top-1/2 left-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl'/>
                </div>

                <div className='relative max-w-3xl animate-fade-up'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6'>
                        <Sparkles className='w-3 h-3 text-brand-400'/>
                        <span className='text-xs font-display text-brand-400 font-medium'>AI-Powered Analytics Platform</span>
                    </div>
                    <h1 className='text-5xl md:text-6xl font-display font-black text-zinc-100 leading-tight mb-6'>
                        Turn raw data into <br/>
                        <span className='text-brand-400'>intelligent insights</span>
                    </h1>
                    <p className='text-zinc-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed'>
                        Upload your dataset. Clean, visualize, and chat with it using AI.
                        Collaborate with your team in real-time - all in one platform.
                    </p>

                    <div className='flex items-center justify-center gap-3 flex-wrap'>
                        <button
                            onClick={() => navigate('/register')}
                            className='btn-primary flex items-center gap-2 text-base px-6 py-3'>
                            Get Started <ArrowRight className='w-4 h-4'/>
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className='btn-ghost border border-white/10 text-base px-6 py-3 rounded-xl'>
                            Sign in
                        </button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="relative mt-16 flex items-center gap-8 flex-wrap justify-center">
                    {STATS.map(({ icon: Icon, val, label }) => (
                        <div key={label} className='flex items-center gap-2'>
                            <Icon className='w-4 h-4 text-brand-400'/>
                            <span className='font-display font-bold text-zinc-100'>{val}</span>
                            <span className='text-xs text-zinc-500'>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Scroll cue */}
                <button onClick={scrollDown} className='absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 hover:text-zinc-400 transition-colors animate-bounce'>
                    <ChevronDown className='w-5 h-5'/>
                </button>
            </section>

            {/* Features */}
            <section className='max-w-6xl mx-auto px-6 py-24'>
                <Reveal className='text-center mb-14'>
                    <p className='text-xs font-display font-semibold text-brand-400 uppercase tracking-widest mb-2'>Features</p>
                    <h2 className='text-3xl font-display font-black text-zinc-100'>Everything you need to understand your data</h2>
                </Reveal>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    {FEATURES.map(({ icon: Icon, label, color, desc }, i) => (
                        <Reveal key={label} delay={i*80}>
                            <div className='card hover:border-white/10 hover:bg-surface-700 transition-all duration-200 group cursor-default h-full'>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                                    <Icon className='w-5 h-5'/>
                                </div>
                                <h3 className='font-display font-bold text-zinc-100 mb-2 group-hover:text-brand-300 transition-colors'>{label}</h3>
                                <p className='text-sm text-zinc-500 leading-relaxed'>{desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Workflow */}
            <section className='border-y border-white/5 bg-surface-800/40 py-24 px-6'>
                <div className='max-w-5xl mx-auto'>
                    <Reveal className='text-center mb-14'>
                        <p className='text-xs font-display font-semibold text-brand-400 uppercase tracking-widest mb-2'>Workflow</p>
                        <h2 className='text-3xl font-display font-black text-zinc-100'>Five steps from raw data to insights</h2>
                    </Reveal>

                    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                        {WORKFLOW.map(({ icon: Icon, label, desc }, i) => (
                            <Reveal key={label} delay={i*100} className='flex-1 w-full'>
                                <div className='flex flex-col items-center text-center gap-3'>
                                    <div className='w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center'>
                                        <Icon className='w-5 h-5 text-brand-400'/>
                                    </div>
                                    <div>
                                        <p className='font-display font-semibold text-zinc-100 text-sm'>{label}</p>
                                        <p className='text-xs text-zinc-500 mt-0.5'>{desc}</p>
                                    </div>
                                    {i < WORKFLOW.length - 1 && (
                                        <ArrowRight className='hidden md:block absolute right-[-18px] top-4 w-4 h-4 text-zinc-700'/>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className='py-24 px-6 text-center'>
                <Reveal>
                    <div className='max-w-xl mx-auto'>
                        <h2 className='text-3xl font-display font-black text-zinc-100 mb-4'>
                            Ready to explore your data?
                        </h2>
                        <p className='text-zinc-500 mb-8 text-sm'>Start free. No credit card required.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className='btn-primary text-base px-8 py-3 flex items-center gap-2 mx-auto'
                        >
                            Get Started <ArrowRight className='w-4 h-4'/>
                        </button>
                    </div>
                </Reveal>
            </section>

            {/* Footer */}
            <footer className='border-t border-white/5 py-8 px-6'>
                <div className='max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                        <Sparkles className='w-4 h-4 text-brand-400'/>
                        <span className='font-display font-bold text-sm text-zinc-400'>
                            Arthlytics <span className='text-brand-400'>AI</span>
                        </span>
                    </div>
                    <div className='flex items-center gap-5 text-xs text-zinc-500'>
                        <button onClick={() => navigate('/docs')} className='hover:text-zinc-300 transition-colors flex items-center gap-1'>
                            <FileText className='w-3.5 h-3.5'/> Docs
                        </button>
                        <a href='https://github.com/AnubhavDataSci25' target='_blank' rel='noreferrer' className='hover:text-zinc-300 transition-colors flex items-center gap-1'>
                            <Github className='w-3.5 h-3.5'/> GitHub
                        </a>
                        <button onClick={() => navigate('/login')} className='hover:text-zinc-300 transition-colors'>Sign in</button>
                        <button onClick={() => navigate('/register')} className='hover:text-zinc-300 transition-colors'>Register</button>
                    </div>
                </div>
            </footer>
        </div>
    )
}