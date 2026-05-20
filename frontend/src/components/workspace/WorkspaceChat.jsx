import { useState, useEffect, useRef, useCallback } from "react";
import {Send, Loader2, Bot, Circle} from 'lucide-react';
import useAuthStore from "../../store/authStore";
import { useMessages } from "../../hooks/useWorkspace";
import clsx from 'clsx';

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'

function ChatMessage({msg, currentUserId}){
    const isMe = msg.user_id === currentUserId
    return (
        <div className={clsx("flex gap-2.5", isMe && 'flex-row-reverse')}>
            <div className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-display font-bold",
                isMe ? 'bg-brand-500/20 text-brand-400' : 'bg-white/5 text-zinc-400'
            )}>
                {msg.username?.[0]?.toUpperCase()}
            </div>
            <div className={clsx("max-w-[75%]", isMe && 'items-end flex flex-col')}>
                <span className="text-xs text-zinc-600 mb-1">{msg.username}</span>
                <div className={clsx(
                    "px-2 py-2 rounded-xl text-sm leading-relaxed",
                    isMe
                        ? 'bg-brand-500/15 text-zinc-100 border border-brand-500/20'
                        : 'bg-surface-700 text-zinc-300 border border-white/5'
                )}>
                    {msg.content}
                </div>
                <span className="text-xs text-zinc-700 mt-1">
                    {new Date(msg.created_at).toLocaleDateString([], {hour: '2-digit', minute: '2-digit'})}
                </span>
            </div>
        </div>
    )
}

function SystemMessage({content}){
    return (
        <div className="flex items-center justify-center gap-2 py-1">
            <div className="h-px flex-1 bg-white/5"/>
            <span className="text-xs text-zinc-600">{content}</span>
            <div className="h-px flex-1 bg-white/5"/>
        </div>
    )
}

export default function WorkspaceChat({project}){
    const token = useAuthStore(s => s.token)
    const user = useAuthStore(s => s.user)
    const {data: history=[]} = useMessages(project.id)

    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [online, setOnline] = useState([])
    const [wsReady, setWsReady] = useState(false)
    const wsRef = useRef(null)
    const bottomRef = useRef(null)

    // Merge history into meaasges on load
    useEffect(() => {
        if (history.length) {
            setMessages(history.map(m => ({...m, type: 'chat'})))
        }
    }, [history])

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    // WebSocket connect
    useEffect(() => {
        if (!token || !project?.id) return
        const ws = new WebSocket(`${WS_BASE}/ws/project/${project.id}?token=${token}`)
        wsRef.current = ws

        ws.onopen = () => setWsReady(true)
        ws.onclose = () => setWsReady(false)

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'system'){
                setOnline(data.online ?? [])
                setMessages(p => [...p, {type: 'system', content: data.content, id: Date.now()}])
            } else if (data.type === 'chat') {
                setMessages(p => [...p, {...data, type: 'chat'}])
            }
        }
        return () => ws.close()
    }, [project.id, token])

    const send = () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
        wsRef.current.send(JSON.stringify({content: input.trim()}))
        setInput('')
    }

    return (
        <div className="flex flex-col h-full">
            {/* {Online bar} */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-surface-800/50">
                <Circle className={clsx("w-2 h-2 fill-current", wsReady ? 'text-brand-400' : 'text-zinc-600')}/>
                <span className="text-xs text-zinc-500">
                    {wsReady ? `${online.length} online` : 'Connecting...'}
                </span>
                {online.length > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                        {online.map(u => (
                            <span key={u} className="text-xs px-1.5 py-0.5 bg-brand-500/10 text-brand-400 rounded font-mono">{u}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* {Messages} */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot className="w-8 h-8 text-zinc-700 mb-2"/>
                        <p className="text-xs text-zinc-600">No messages yet. Start the conversation!</p>
                    </div>
                ) : messages.map((msg, i) =>
                msg.type === 'system'
                    ? <SystemMessage key={msg.id ?? i} content={msg.content} />
                    : <ChatMessage key={msg.id ?? i} msg={msg} currentUserId={user?.id} />
                )}
                <div ref={bottomRef}/>
            </div>

            {/* {Input} */}
            <div className="border-t border-white/5 px-4 py-3 flex items-center gap-3">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder={wsReady ? "Type a message..." : 'Connecting...'}
                    disabled={!wsReady}
                    className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:opacity-40"
                />
                <button
                    onClick={send}
                    disabled={!wsReady || !input.trim()}
                    className="btn-primary px-3 py-2 disabled:opacity-40"
                >
                    <Send className="w-3.5 h-3.5"/>
                </button>
            </div>
        </div>
    )
}
