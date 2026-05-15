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
            { label: 'HuggingFace', id: 'huggingface'},
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
                        ].map(([step, desc], i, arr) => (
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
            <section id="quickstart" className="scroll-mt-20 mb-12">
                <H2 id="quickstart">Quick Start</H2>
                <P>Get running in 4 steps after account creation.</P>
                <Step n="1" title="Create account" desc="Register with email, username and password on the register page."/>
                <Step n="2" title="Upload dataset" desc="Gp to CleanStats → drag-drop your CSV or Excel file. Supports up to 10MB."/>
                <Step n="3" title="Run CleanStats" desc="Click 'Run Cleaning' to auto-clean data and view statistical summary. Enable 'Insights' for AI-generated observations."/>
                <Step n="4" title="Explore features" desc="Use AutoViz to generate charts, SmartQuery to ask questions, and Workspace to collaborate."/>
                <InfoBox type='tip' title="Tip">
                    Start with a small dataset (under 1000 rows) to see instant results. Larger datasets work fine but take longer to index.
                </InfoBox>
            </section>

            {/* Features */}
            <section id='features' className='scroll-mt-20 mb-4'>
                <H2 id="features">Core Features</H2>
            </section>

            <section id="cleanstats" className='scroll-mt-20 mb-10'>
                <H3>CleanStats</H3>
                <P>Automated data cleaning and statistical analysis engine.</P>
                <FeatureCard icon={BarChart2} label="Auto Cleaning" color="text-brand-400 bg-brand-500/10"
                    desc="Removes duplicate rows, fills missing values (median for numeric, mode for categorical), detects dtype inconsistencies." />
                <FeatureCard icon={Zap} label="Outlier Detection" color="text-amber-400 bg-amber-500/10"
                    desc="IQR-based outlier detection per numeric column. Option to remove or keep outliers."/>
                <FeatureCard icon={Brain} label="AI Insights" color="text-violet-400 bg-violet-500/10"
                    desc="LLM reads dataset stats and generates observations about trends, distributions, and data quality." />
                <InfoBox type='info' title="Supported formats">
                    CSV (.csv) and Excel (.xlsx, .xls). Max file size: 10MB.
                </InfoBox>
                <P>After cleaning, download the processed dataset directly as CSV.</P>
            </section>

            <section id="autoviz" className='scroll-mt-20 mb-10'>
                <H3>AutoViz</H3>
                <P>Describe a chart in plain English. AI picks chart type, columns, and aggregation. Frontend renders it with Recharts - no code required.</P>
                <div className='card mb-4'>
                    <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>Example queries</p>
                    {[
                        'Show me sales by city as a bar chart',
                        'What is the trend of prices over time?',
                        'Distribution of property types as a pie chart',
                        'Average price per bedroom count',
                    ].map(q => (
                        <div key={q} className='flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0'>
                            <ArrowRight className='w-3 h-3 text-brand-400 shrink-0'/>
                            <span className='text-xs text-zinc-400 italic'>"{q}"</span>
                        </div>
                    ))}
                </div>
                <P>Supported chart types: bar, line, area, scatter, pie, histogram.</P>
                <InfoBox type='warning' title="Note">
                    AutoViz works best with clearly named columns. Rename columns like "col1" to meaningful names before uploading.
                </InfoBox>
            </section>

            <section id="smartquery" className='scroll-mt-20 mb-10'>
                <H3>SmartQuery</H3>
                <P>AI-Powered chat with your dataset. Ask any question in plain English - get accurate, SQL-backed answers.</P>
                <div className='card mb-4'>
                    <p className='text-xs text-zinc-500 mb-3'>How it works internally:</p>
                    {[
                        'CSV loaded into SQLite database (one-time per file)',
                        'LangChain SQL Agent receives your question',
                        'Agent inspects table schema using built-in tools',
                        'Agent writes SQL → validates → executes',
                        'Raw result passed to LLM → human-readable answer returned',
                    ].map((s, i) => (
                        <div key={i} className='flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0'>
                            <span className='text-brand-400 font-mono text-xs shrink-0 mt-0.5'>{i+1}.</span>
                            <span className='text-xs text-zinc-400'>{s}</span>
                        </div>
                    ))}
                </div>
                <InfoBox type='tip' title="Best results">
                    Ask specific questions with column names when possible. Example: "What is the average price for 3 BHK properties in Mumbai?"
                </InfoBox>
            </section>

            <section id="workspace" className='scroll-mt-20 mb-10'>
                <H3>Collaborative Workspace</H3>
                <P>Create shared projects, invite teammates, and collaborate in real-time.</P>
                <FeatureCard icon={Users} label="Project System" color="text-amber-400 bg-amber-500/10"
                    desc="Create projects with unique invite codes. Members join via code. Each project has isolated chat history and shared context."/>
                <FeatureCard icon={MessageSquare} label="Real-time Chat" color="text-sky-400 bg-sky-500/10"
                    desc="WebSocket-powered messaging. Messages broadcast instantly to all online members. Full history persisted in database."/>            
            </section>

            {/* AI & Models */}
            <section id='ai' className='scroll-mt-20 mb-4'>
                <H2 id="ai">AI & Models</H2>
            </section>

            <section id='models' className='scroll-mt-20 mb-10'>
                <H3>Models Used</H3>
                <div className='card'>
                    <TechRow name="llama-3.1-8b-instant" badge="Groq - SmartQuery primary LLM" desc="Fast inference, used for SQL result humanization and chat answers."/>
                    <TechRow name="gemini-2.5-flash" badge="Google - AutoViz LLM" desc="Chart config generation from natural language queries." />
                    <TechRow name="gpt-oss-20b" badge="Groq + HuggingFace - CleanStats insights" desc="Generates natural language observations from dataset statistics."/>
                </div>
                <InfoBox type='info' title="Model fallback">
                    If Groq is unavailable, system falls back to Gemini automatically. No configuration needed.
                </InfoBox>
            </section>

            <section id='sqlagent' className='scroll-mt-20 mb-10'>
                <H3>SQL Agent</H3>
                <P>LangChain SQL Agent with 4 tools: list tables, inspect schema, validate SQL, execute query. Agent follows strict workflow - no hallucination of table or column names.</P>
                <div className='card'>
                    {[
                        { tool: 'sql_db_list_tables', desc: 'Discovers available tables'},
                        { tool: 'sql_db_schema', desc: 'Reads column names and types'},
                        { tool: 'sql_db_query_checker', desc: 'Validates SQL before execution'},
                        { tool: 'sql_db_query', desc: 'Executes query, returns result'},
                    ].map(({ tool, desc }) => (
                        <div key={tool} className='flex items-start gap-3 py-2 border-b border-white/5 last:border-0'>
                            <code className='text-xs font-mono text-sky-400 shrink-0 mt-0.5'>{tool}</code>
                            <span className='text-xs text-zinc-500'>{desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id='langchain' className='scroll-mt-20 mb-10'>
                <H3>LangChain</H3>
                <P>LangChain orchestrates the full AI pipeline — prompt templates, tool calling, agent loops, and output parsing. LangSmith tracing enabled for debugging and performance monitoring.</P>
            </section>

            <section id='huggingface' className='scroll-mt-20 mb-10'>
                <H3>HuggingFace</H3>
                <P>HuggingFace orchestrates the AI pipeline for CleanStats natural language insights generation pipeline — it generate insights based on stats from dataset.</P>
            </section>

            {/* Architecture */}
            <section id='architecture' className='scroll-mt-20 mb-4'>
                <H2 id='architecture'>Architecture</H2>
            </section>

            <section id='techstack' className='scroll-mt-20 mb-10'>
                <H3>Tech Stack</H3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {[
                        {cat: 'Frontend', icon: Globe, items: ['React JS', 'Vite', 'TailwindCSS', 'Zustand', 'React Query', 'Recharts']},
                        {cat: 'Backend', icon: Server, items: ['FastAPI', 'SQLAlchemy', 'Alembic', 'Uvicorn', 'WebSockets']},
                        {cat: 'Database', icon: Database, items: ['PostgreSQL', 'SQLite (per-file)', 'Redis (palnned)']},
                        {cat: 'AI Layer', icon: Brain, items: ['LangChain', 'LangSmith', 'HuggingFace', 'Groq', 'Gemini']},
                    ].map(({ cat, icon: Icon, items }) => (
                        <div key={cat} className='card'>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon className='w-4 h-4 text-brand-400'/>
                                <p className='text-xs font-display font-semibold text-zinc-400 uppercase tracking-widest'>{cat}</p>
                            </div>
                            <div className='flex flex-wrap gap-1.5'>
                                {items.map(i => <Badge key={i}>{i}</Badge>)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id='backend' className='scroll-mt-20 mb-10'>
                <H3>Backend</H3>
                <P>FastAPI backend with modular router architecture. Each feature (auth, upload, stats, visualize, chat, projects) is an isolated router registered in main file.</P>
                <div className='card font-mono text-xs text-zinc-400 space-y-1'>
                    {[
                        'POST /api/auth/register     — create account',
                        'POST /api/auth/login        — get JWT token',
                        'POST /api/upload            — upload CSV/XLSX',
                        'GET  /api/stats/{id}        — basic stats',
                        'GET  /api/stats/{id}?clean  — full cleaning',
                        'POST /api/visualize         — generate chart',
                        'POST /api/chat              — SmartQuery',
                        'POST /api/projects          — create project',
                        'WS   /ws/project/{id}       — real-time chat'
                    ].map(r => <div key={r}><span className='text-brand-400'>{r.split('—')[0]}</span><span className='text-zinc-600'>—{r.split('—')[1]}</span></div>)}
                </div>
            </section>

            <section id='database' className='scroll-mt-20 mb-10'>
                <H3>Database</H3>
                <P>PostgreSQL for persistent storage. Alembic handles schema migrations. Each uploaded file gets a dedicated SQLite database for SmartQuery — isolated per user, per file.</P>
                <div className='card'>
                    {[
                        { table: 'users', desc: 'Auth credentials, profile'},
                        { table: 'uploaded_files', desc:'File metadata, shape, path'},
                        { table: 'projects', desc: 'Collaborative workspace projects'},
                        { table: 'project_members', desc: 'Membership + role assignments'},
                        { table: 'messages', desc: 'Persistent chat history'},
                    ].map(({ table, desc}) => (
                        <div key={table} className='flex items-center gap-3 py-2 border-b border-white/5 last:border-0'>
                            <code className='text-xs font-mono text-violet-400 shrink-0'>{table}</code>
                            <span className='text-xs text-zinc-500'>{desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security */}
            <section id='security' className='scroll-mt-20 mb-4'>
                <H2 id='security'>Security</H2>
            </section>

            <section id='auth' className='scroll-mt-20 mb-10'>
                <H3>Authentication</H3>
                <P>JWT-based stateless authentication. Tokens expire after 24 hours. Passwords hashed with bcrypt (SHA256 pre-hashing to handle long passwords safely).</P>
                <div className='card'>
                    {[
                        ['Token type',          'Bearer JWT'],
                        ['Expiry',              '24 hours'],
                        ['Password hash',       'bcrypt + SHA256'],
                        ['Protected',           'All routes except /login, /register, /docs'],
                    ].map(([k, v]) => (
                        <div key={k} className='flex items-center gap-3 py-2 border-b border-white/5 last:border-0'>
                            <span className='text-xs text-zinc-500 w-32 shrink-0'>{k}</span>
                            <span className='text-xs text-zinc-300 font-mono'>{v}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id='privacy' className='scroll-mt-20 mb-10'>
                <H3>Data Privacy</H3>
                <P>Files stored server-side, isolated per user. Only the file owner can access, analyze, or delete their uploads. SmartQuery SQLite databses are scoped per file — no cross-user data access possible.</P>
                <InfoBox type='warning' title='Important'>
                    Do not upload files containing sensitive personal information (PII). Arthlytics AI is designed for analytical datasets, not personal records.
                </InfoBox>
            </section>

            {/* Collaboration */}
            <section id='collab' className='scroll-mt-20 mb-4'>
                <H2 id='collab'>Collaboration</H2>
            </section>

            <section id='projects' className='scroll-mt-20 mb-10'>
                <H3>Projects</H3>
                <P>Create a project to start collaborating. Each project has a unique invite code. Share the code with teammates — they join via the Workspace page.</P>
            </section>

            <section id='roles' className='scroll-mt-20 mb-10'>
                <H3>Roles</H3>
                <div className='card'>
                    {[
                        { role: 'Admin', color: 'text-red-400', desc: 'Full control. Manage members, change roles, delete project.'},
                        { role: 'Editor', color: 'text-brand-400', desc: 'Can upload files, run analysis, chat. Cannot manage members.'},
                        { role: 'Viewer', color: 'text-zinc-400', desc: 'Read-only. Can view data and chat history.'},
                    ].map(({role, color, desc}) => (
                        <div key={role} className='flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0'>
                            <span className={`text-xs font-display font-bold w-14 shrink-0 mt-0.5 ${color}`}>{role}</span>
                            <span className='text-xs text-zinc-500 leading-relaxed'>{desc}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id='realtime' className='scroll-mt-20 mb-10'>
                <H3>Real-time Chat</H3>
                <P>WebSocket connection established on project open. Messages broadcast instantly to all online members. Authentication via JWT passed as query param during WS handshake. Chat history persisted to PostgreSQL — accessible even after reconnect.</P>
            </section>
        </div>
    )
}

// Sidebar
function Sidebar({ active, onSelect}){
    const [open, setOpen] = useState(() => NAV.map(n => n.id))
    const toggle = id => setOpen(p => p.includes(id) ? p.filter(x => x!== id) : [...p, id])

    return (
        <div className='w-56 shrink-0 py-6 px-3 space-y-0.5 overflow-y-auto scrollbar-thin h-full'>
            {NAV.map(({ label, icon: Icon, id, children}) => (
                <div key={id}>
                    <button
                        onClick={() => toggle(id)}
                        className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all text-xs font-display font-semibold uppercase tracking-widest'
                    >
                        <Icon className='w-3.5 h-3.5 shrink-0'/>
                        <span className='flex-1 text-left'>{label}</span>
                        {open.includes(id)
                        ? <ChevronDown className='w-3 h-3'/>
                        : <ChevronRight className='w-3 h-3'/>
                        }
                    </button>
                    {open.includes(id) && (
                        <div className='ml-3 border-l border-white/5 pl-3 mt-0.5 space-y-0.5'>
                            {children.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => onSelect(c.id)}
                                    className={clsx(
                                        'w-full text-left px-2 py-1.5 rounded-md text-xs transition-all',
                                        active === c.id
                                        ? 'text-brand-400 bg-brand-500/10 font-medium'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                    )}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// Main
export default function Docs(){
    const navigate = useNavigate()
    const [active, setActive] = useState('intro')
    const [mobileOpen, setMobileOpen] = useState(false)
    const mainRef =useRef(null)

    const scrollTo = id => {
        setActive(id)
        setMobileOpen(false)
        const el = document.getElementById(id)
        if (!el || !mainRef.current) return
        const mainRect = mainRef.current.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const offset = 80
        mainRef.current.scrollTo += elRect.top - mainRect.top - offset
    }

    // Track active section on scroll
    useEffect(() => {
        const allIds = NAV.flatMap(n => n.children.map(c => c.id))
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) })
        }, { rootMargin: '-30% 0px -60% 0px' })
        allIds.forEach(id => {
            const el = document.getElementById(id)
            if (el) obs.observe(el)
        })
        return () => obs.disconnect()
    }, [])

    return (
        <div className='min-h-screen bg-surface-900 flex flex-col'>
            {/* Top bar */}
            <header className='sticky top-0 z-40 border-b border-white/5 bg-surface-900/90 backdrop-blur'>
                <div className='max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => setMobileOpen(p => !p)}
                            className='md:hidden text-zinc-400 hover:text-zinc-100'
                        >
                            {mobileOpen ? <X className='w-5 h-5'/> : <Menu className='w-5 h-5'/>}
                        </button>
                        <button onClick={() => navigate('/')} className='flex items-center gap-2'>
                            <Sparkles className='w-4 h-4 text-brand-400'/>
                            <span className='font-display font-bold text-sm text-zinc-100'>
                                Arthlytics <span className='text-brand-400'>AI</span>
                            </span>
                        </button>
                        <span className='text-zinc-700'>/</span>
                        <span className='text-xs text-zinc-500 font-display'>Docs</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button onClick={() => navigate('/login')} className='btn-ghost text-xs'>Sign in</button>
                        <button onClick={() => navigate('/register')} className='btn-primary text-xs px-4 py-2'>Get Started</button>
                    </div>
                </div>
            </header>

            <div className='flex flex-1 max-w-7xl mx-auto w-full'>
                {/* Desktop sidebar */}
                <aside className='hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] border-r border-white/5'>
                    <Sidebar active={active} onSelect={scrollTo}/>
                </aside>

                {/* Mobile Sidebar */}
                {mobileOpen && (
                    <div className='fixed inset-0 z-30 bg-surface-900/95 pt-14 md:hidden'>
                        <Sidebar active={active} onSelect={scrollTo}/>
                    </div>
                )}

                {/* Content */}
                <main ref={mainRef} className='flex-1 px-6 md:px-12 py-10 overflow-y-auto'>
                    <DocContent/>
                </main>
            </div>
        </div>
    )
}