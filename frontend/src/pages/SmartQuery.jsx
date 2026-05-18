import {useState, useRef, useEffect} from 'react';
import {MessageSquare, Send, Loader2, Sparkles, Bot, User, Trash2} from 'lucide-react';
import {useFiles} from '@/hooks/useCleanStats';
import { chatService } from '@/services/chatService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUGGESTIONS = [
    'What is the average price?',
    'How many rows are in this dataset?',
    'What are the top 5 most common values?',
    'Show summary statistics',
]

function Message({msg}){
    const isUser = msg.role === 'user'
    return (
        <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
            <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                isUser ? 'bg-brand-500/20' : 'bg-white/5'
            )}>
                {isUser
                    ? <User className='w-3.5 h-3.5 text-brand-400'/>
                    : <Bot className='w-3.5 h-3.5 text-zinc-400'/>
                }
            </div>
            <div className={clsx(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                isUser
                    ? 'bg-brand-500/15 text-zinc-100 border border-brand-500/20'
                    : 'bg-surface-700 text-zinc-300 border border-white/5'
            )}>
                {msg.content}
                {msg.meta && (
                    <div className='mt-2 pt-2 border-t border-white/10 flex items-center gap-3'>
                        <span className='text-xs text-zinc-600'>{msg.meta.model}</span>
                        <span className='text-xs text-zinc-700'>·</span>
                        <span className='text-xs text-zinc-600'>{msg.meta.source}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function SmartQuery(){
    const {data: files = []} = useFiles()
    const [selectedId, setSelectedId] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    const send = async (q = input) => {
        if (!selectedId) {toast.error('Select a file first'); return}
        if (!q.trim()) {toast.error('Enter a question'); return}

        const userMsg = {role: 'user', content: q}
        setMessages(p => [...p, userMsg])
        setInput('')
        setLoading(true)

        try{
            const {data} = await chatService.query(selectedId, q)
            setMessages(p => [...p, {
                role: 'assistant',
                content: data.answer,
                meta: {model: data.model_used, source: data.source_file},
            }])
        } catch (err) {
            setMessages(p => [...p, {
                role: 'assistant',
                content: '❌ ' + (err.response?.data?.detail ?? 'Query failed'),
            }])
        } finally {
            setLoading(false)
        }
    }

    const clearChat = () => setMessages([])

    const selectedFile = files.find(f => f.id === selectedId)

    return (
        <div className='p-8 space-y-6 animate-fade-up'>
            {/* {Header} */}
            <div>
                <p className='text-xs text-zinc-500 font-display uppercase tracking-widest mb-1'>Feature</p>
                <h1 className='text-2xl font-display font-bold text-zinc-100'>SmartQuery</h1>
                <p className='text-sm text-zinc-400 mt-1'>Ask questions about your data. SQL agent gives accurate answers.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* {Left panel} */}
                <div className='space-y-4'>
                    {/* {File selector} */}
                    <div className='card'>
                        <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>Dataset</p>
                        {files.length === 0
                            ? <p className='text-xs text-zinc-600'>No files. Upload in CleanStats first.</p>
                            : <div className='space-y-1'>
                                {files.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => {setSelectedId(f.id); clearChat()}}
                                        className={clsx(
                                            'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                                            selectedId === f.id
                                                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                                                : 'text-zinc-400 hover:bg-white/5 border border-transparent'
                                        )}
                                    >
                                        <p className='font-medium truncate'>{f.original_name}</p>
                                        <p className='text-zinc-600'>{f.row_count ?? '—'} rows · {f.col_count ?? '—'}</p>
                                    </button>
                                ))}
                            </div>
                        }
                    </div>

                    {/* {Suggestions} */}
                    <div className='card'>
                        <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>Try asking</p>
                        <div className='space-y-1.5'>
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => send(s)}
                                    disabled={!selectedId || loading}
                                    className='w-full text-left text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-3 py-2 rounded-lg transition-all disabled:opacity-40'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* {Selected file info} */}
                    {selectedFile && (
                        <div className='card space-y-2'>
                            <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest'>Active file</p>
                            <p className='text-xs text-zinc-300 font-medium truncate'>{selectedFile.original_name}</p>
                            <div className='flex gap-3 text-xs text-zinc-600'>
                                <span>{selectedFile.row_count?.toLocaleString()} rows</span>
                                <span>·</span>
                                <span>{selectedFile.col_count} cols</span>
                            </div>
                            {selectedFile.columns && (
                                <div className='flex flex-wrap gap-1 pt-1'>
                                    {selectedFile.columns.slice(0,6).map(c => (
                                        <span key={c} className='text-xs px-1.5 py-0.5 bg-white/5 text-zinc-500 rounded font-mono'>{c}</span>
                                    ))}
                                    {selectedFile.columns.length > 6 && (
                                        <span className='text-xs text-zinc-700'>+{selectedFile.columns.length - 6}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* {Right - chat} */}
                <div className='lg:col-span-2 flex flex-col gap-4'>
                    {/* {Chat window} */}
                    <div className='card p-0 overflow-hidden flex flex-col' style={{height: '520px'}}>
                        {/* {Chat header} */}
                        <div className='flex items-center justify-between px-4 py-3 border-b border-white/5'>
                            <div className='flex items-center gap-2'>
                                <Sparkles className='w-3.5 h-3.5 text-brand-400'/>
                                <span className='text-xs font-display font-semibold text-zinc-400'>
                                    {selectedFile ? selectedFile.original_name : 'Select a file to start'}
                                </span>
                            </div>
                            {messages.length > 0 && (
                                <button onClick={clearChat} className='text-zinc-600 hover:text-zinc-400 transition-colors'>
                                    <Trash2 className='w-3.5 h-3.5'/>
                                </button>
                            )}
                        </div>

                        {/* {Messages} */}
                        <div className='flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4'>
                            {messages.length === 0 ? (
                                <div className='flex flex-col items-center justify-center h-full text-center'>
                                    <MessageSquare className='w-10 h-10 text-zinc-700 mb-3'/>
                                    <p className='text-sm text-zinc-500'>Ask anything about your data</p>
                                    <p className='text-xs text-zinc-700 mt-1'>SQL agent answers with precision</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => <Message key={i} msg={msg}/>)
                            )}
                            {loading && (
                                <div className='flex gap-3'>
                                    <div className='w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0'>
                                        <Bot className='w-3.5 h-3.5 text-zinc-400'/>
                                    </div>
                                    <div className='bg-surface-700 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-2'>
                                        <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                                        <span className='text-xs text-zinc-500'>Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* {Input} */}
                        <div className='border-t border-white/5 px-4 py-3 flex items-center gap-3'>
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                placeholder={selectedId ? 'Ask about your data...' : 'Select a file first'}
                                disabled={!selectedId || loading}
                                className='flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:opacity-40'    
                            />
                            <button
                                onClick={() => send()}
                                disabled={!selectedId || loading || !input.trim()}
                                className='btn-primary px-3 py-2 disabled:opacity-40'
                            >
                                <Send className='w-3.5 h-3.5' />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
