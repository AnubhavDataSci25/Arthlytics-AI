import { useState, useEffect, useRef, Children } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, ChevronRight, ChevronDown, Menu, X,
    BookOpen, Rocket, Layers, Brain, Users, Shield,
    Upload, BarChart2, LineChart, MessageSquare, Zap,
    ArrowRight, Code2, Database, Server, Globe, Lock
} from 'lucide-react';
import clsx from 'clsx';

// Sidebar structure
const NAV = [
    {
        label: 'Getting Started', icon: Rocket, id: 'getting-started',
        children: [
            { label: 'Introduction', id: 'intro'},
            { label: 'How It Works', id: 'how'},
            { label: 'Quick Start', id: 'quickstart'},
        ]
    },
    {
        label: 'Core Features', icon: Layers, id: 'features',
        children: [
            { label: 'CleanStats', id: 'cleanstats'},
            { label: 'AutoViz', id: 'autoviz'},
            { label: 'SmartQuery', id: 'smartquery'},
            { label: 'Workspace', id: 'workspace'},
        ]
    },
    {
        label: 'AI & Models', icon: Brain, id: 'ai',
        children: [
            { label: 'Models Used', id: 'models'},
            { label: 'SQL Agent', id: 'sqlagent'},
            { label: 'LangChain', id: 'langchain'},
            { label: 'HuggingFace', id: 'HuggingFace'},
        ]
    },
    {
        label: 'Architecture', icon: Server, id: 'architecture',
        children: [
            { label: 'Tech Stack', id: 'techstack'},
            { label: 'Backend', id: 'backend'},
            { label: 'Database', id: 'database'},
        ]
    },
    {
        label: 'Security', icon: Shield, id: 'security',
        children: [
            { label: 'Authentication', id: 'auth'},
            { label: 'Data Privacy', id: 'privacy'},
        ]
    },
    {
        label: 'Collaboration', icon: Users, id: 'collab',
        children: [
            { label: 'Projects', id: 'projects'},
            { label: 'Roles', id: 'roles'},
            { label: 'Real-time Chat', id: 'realtime'},
        ]
    },
]

// Section components
function H1({ children }){
    return <h1 className='text-3xl font-display font-black text-zinc-100 mb-2'>{children}</h1>
}

function H2({ children, id }){
    return <h2 id={id} className='text-xl font-display font-bold text-zinc-100 mt-10 mb-3 scroll-mt-20'>{children}</h2>
}

function H3({ children }){
    return <h3 className='text-base font-display font-semibold text-zinc-200 mt-6 mb-2'>{children}</h3>
}

function P({ children }){
    return <p className='text-sm text-zinc-400 leading-relaxed mb-3'>{children}</p>
}

function Badge({ children, color='brand'}) {
    const colors = {
        brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border ${colors[color]}`}>
            {children}
        </span>
    )
}

function InfoBox({ title, children, type='info'}) {
    const styles = {
        info: 'border-brand-500/30 bg-brand-500/5',
        warning: 'border-amber-500/30 bg-amber-500/5',
        tip: 'border-violet-500/30 bg-violet-500/5',
    }
    return (
        <div className={`border rounded-lg p-4 my-4 ${styles[type]}`}>
            {title && <p className='text-xs font-display font-semibold text-zinc-400 uppercase tracking-widest mb-1'>{title}</p>}
            <p className='text-sm text-zinc-400 leading-relaxed'>{children}</p>
        </div>
    )
}

function FeatureCard({ icon: Icon, label, color, desc }) {
    return (
        <div className='card flex items-start gap-3 mb-3'>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4"/>
            </div>
            <div>
                <p className='text-sm font-display font-semibold text-zinc-200'>{label}</p>
                <p className='text-xs text-zinc-500 mt-0.5 leading-relaxed'>{desc}</p>
            </div>
        </div>
    )
}

function TechRow({ name, badge, desc }){
    return (
        <div className='flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0'>
            <code className='text-xs font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded shrink-0 mt-0.5'>{name}</code>
            <div>
                <span className='text-xs text-zinc-300'>{badge}</span>
                {desc && <p className='text-xs text-zinc-600 mt-0.5'>{desc}</p>}
            </div>
        </div>
    )
}

function Step({ n, title, desc }) {
    return (
        <div className='flex gap-4 mb-4'>
            <div className='w-7 h-7 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5'>
                <span className='text-xs font-display font-bold text-brand-400'>{n}</span>
            </div>
            <div>
                <p className='text-sm font-display font-semibold text-zinc-200'>{title}</p>
                <p className='text-xs text-zinc-500 mt-0.5 leading-relaxed'>{desc}</p>
            </div>
        </div>
    )
}

// Content
function DocContent() {
    return (
        <div className='max-w-2xl'>
            {/* Intro */}
            <section id='intro' className='scroll-mt-20 mb-12'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4'>
                    <Sparkles className='w-3 h-3 text-brand-400'/>
                    <span className='text-xs font-display text-brand-400 font-medium'>Documentation</span>
                </div>
                <H1>Arthlytics AI</H1>
                <p className='text-zinc-400 text-base leading-relaxed mb-6'>
                    Full-stack AI analytics platform. Upload datasets, auto-clean them, visualize with natural
                    language, chat with data via SQL agent, and collaborate in real-time with your team.
                </p>
                <div className='flex flex-wrap gap-2'>
                    {['FastAPI', 'React', 'LangChain', 'Groq', 'PostgreSQL', 'WebSocket'].map(t => (
                        <Badge key={t}>{t}</Badge>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id='how' className='scroll-mt-20 mb-12'>
                <H2 id='how'>How It Works</H2>
                <P>Arthlytics AI follows a simple pipeline from raw data to actionable insights.</P>
                <div className='card mb-4'>
                    <div className='flex flex-col gap-2 text-sm'>
                        {[
                            ['Upload', 'CSV or Excel file uploaded securely to server'],
                            ['Store', 'File metadata saved to PostgreSQL, file to disk'],
                            ['Clean', 'Auto-preprocessing: nulls, dupes, outliers, dtypes'],
                            ['Analyse', 'Statistical summary per column generated'],
                            ['Visualize', 'LLM reads column schema → returns chart config → Recharts renders'],
                            ['Query', 'SQL agent converts question → SQLite query → exact answer'],
                            ['Collaborate', 'WebSocket broadcasts messages to all project members'],
                        ].map(([Step, desc], i, arr) => (
                            <div key={step}>
                                <div className='flex items-start gap-3'>
                                    <span className='text-brand-400 font-display font-bold text-xs w-20 shrink-0 mt-0.5'>{step}</span>
                                    <span className='text-zinc-400 text-xs leading-relaxed'>{desc}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className='ml-[5.5rem] mt-1 mb-1 w-px h-3 bg-white/10'/>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Start */}
            
        </div>
    )
}