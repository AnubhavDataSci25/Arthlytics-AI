import { useState } from "react";
import {
    Users, Plus, LogIn, Trash2, LogOut, Copy, Check, Loader2,
    ChevronRight, Crown, Edit2, Eye
} from 'lucide-react';
import {
    useProjects, useCreateProject, useJoinProject, useDeleteProject,
    useLeaveProject
} from '@/hooks/useWorkspace';
import WorkspaceChat from "../components/workspace/WorkspaceChat";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";

const ROLE_ICONS = {Admin: Crown, Editor: Edit2, Viewer: Eye}
const ROLE_COLORS = {Admin: 'text-red-400', Editor: 'text-brand-400', Viewer: 'text-zinc-400'}

function CopyButton({text}){
    const [copied, setCopied] = useState(false)
    const copy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button onClick={copy} className="text-zinc-500 hover:text-brand-400 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-brand-400 "/> : <Copy className="w-3.5 h-3.5" />}
        </button>
    )
}

// Create modal
function CreateModal({onClose}){
    const [form, setForm] = useState({name: '', description: ''})
    const create = useCreateProject()

    const submit = async e => {
        e.preventDefault()
        await create.mutateAsync(form)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="card w-full max-w-sm animate-fade-up">
                <h2 className="font-display font-bold text-zinc-100 mb-4">Create Project</h2>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="label">Project Name</label>
                        <input 
                            required value={form.name}
                            onChange={e => setForm(p => ({...p, name: e.target.value}))}
                            placeholder="My Analytics Project"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Description (optional)</label>
                        <input
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value}))}
                            placeholder="What is this project about?"
                            className="input"
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-white/10 rounded-xl">Cancel</button>
                        <button type="submit" disabled={create.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Join modal
function JoinModal({onClose}){
    const [code, setCode] = useState('')
    const join = useJoinProject()

    const submit = async e => {
        e.preventDefault()
        await join.mutateAsync(code.trim().toUpperCase())
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="card w-full max-w-sm animate-fade-up">
                <h2 className="font-display font-bold text-zinc-100 mb-4">Join Projects</h2>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="label">Invite Code</label>
                        <input
                            required value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="ABC123DEFG"
                            className="input font-mono uppercase"
                            maxLength={10}
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button type="buton" onClick={onClose} className="btn-ghost flex-1 border border-white/10 rounded-xl">Cancel</button>
                        <button type="submit" disabled={join.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {join.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                            Join
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Main
export default function Workspace(){
    const user = useAuthStore(s => s.user)
    const {data: projects = [], isLoading} =useProjects()
    const deleteProject = useDeleteProject()
    const leaveProject =useLeaveProject()

    const [activeId, setActiveId] = useState(null)
    const [showCreate, setShowCreate] = useState(false)
    const [showJoin, setShowJoin] = useState(false)

    const active = projects.find(p => p.id === activeId)
    const myRole = active?.members?.find(m => m.user?.id === user?.id)?.role

    return (
        <div className="p-8 space-y-6 animate-fade-up">
            {/* {Header} */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-zinc-500 font-display uppercase tracking-widest mb-1">Feature</p>
                    <h1 className="text-2xl font-display font-bold text-zinc-100">Workspace</h1>
                    <p className="text-sm text-zinc-400 mt-1">Create projects, invite teammates, collaborate in real-time.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowJoin(true)} className="btn-ghost border-white/10 rounded-xl flex items-center gap-2 text-xs">
                        <LogIn className="w-3.5 h-3.5"/> Join
                    </button>
                    <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-xs">
                        <Plus className="w-3.5 h-3.5"/> New Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* {Project list} */}
                <div className="space-y-3">
                    <p className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest">
                        Your Projects ({projects.length})
                    </p>

                    {isLoading ? (
                        <div className="card flex items-center justify-center py-10">
                            <Loader2 className="w-5 h-5 text-brand-400 animate-spin"/>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="carf flex flex-col items-center justify-center py-10 text-center">
                            <Users className="w-8 h-8 text-zinc-700 mb-2"/>
                            <p className="text-xs text-zinc-600">No projects yet.</p>
                            <button onClick={() => setShowCreate(true)} className="btn-primary text-xs mt-3 px-3 py-1.5">
                                Create First Project
                            </button>
                        </div>
                    ) : (
                        projects.map(p => {
                            const role = p.members?.find(m => m.user?.id === user.id)?.role
                            const RoleIcon = ROLE_ICONS[role] ?? Eye
                            const isOwner = p.owner_id === user?.id
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setActiveId(p.id)}
                                    className={clsx(
                                        "card cursor-pointer transition-all duration-150 hover:border-white/10",
                                        activeId === p.id && 'border-brand-500/30 bg-brand-500/5'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="felx items-center gap-2">
                                                <p className="text-sm font-display font-semibold text-zinc-100 truncate">{p.name}</p>
                                                <span className={clsx("text-xs", ROLE_COLORS[role])}>
                                                    <RoleIcon className="w-3 h-3"/>
                                                </span>
                                            </div>
                                            {p.description && (
                                                <p className="text-xs text-zinc-600 mt-0.5 truncate">{p.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-zinc-600">{p.members?.length ?? 0} members</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-zinc-600 font-mono">{p.invite_code}</span>
                                                    <CopyButton text={p.invite_code}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {isOwner ? (
                                                <button
                                                    onClick={e => {e.stopPropagation(); deleteProject.mutate(p.id)}}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                                                    title="Delete project"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5"/>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={e => {e.stopPropagation(); leaveProject.mutate(p.id)}}
                                                    className="text-zinc-600 hover:text-amber-400 transition-colors p-1"
                                                    title="Leave project"
                                                >
                                                    <LogOut className="w-3.5 h-3.5"/>
                                                </button>
                                            )}
                                            <ChevronRight className={clsx("w-3.5 h-3.5 transition-colors", activeId === p.id ? 'text-brand-400':'text-zinc-700')}/>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* {Chat + members} */}
                <div className="lg:col-span-2">
                    {!active ? (
                        <div className="card flex flex-col items-center justify-center py-20 text-center h-full">
                            <Users className="w-10 h-10 text-zinc-700 mb-3"/>
                            <p className="text-sm text-zinc-500">Select a project to open workspace</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* {Project header} */}
                            <div className="card flex items-center justify-between">
                                <div>
                                    <p className="font-display font-bold text-zinc-100">{active.name}</p>
                                    {active.description && <p className="text-xs text-zinc-500 mt-0.5">{active.description}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-600 font-mono px-2 py-1 bg-white/5 rounded">{active.invite_code}</span>
                                    <CopyButton text={active.invite_code}/>
                                </div>
                            </div>

                            {/* {Members} */}
                            <div className="card">
                                <p className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3">Members</p>
                                <div className="flex flex-wrap gap-2">
                                    {active.members?.map(m => {
                                        const RoleIcon = ROLE_ICONS[m.role] ?? Eye
                                        return (
                                            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                                                <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                                                    {m.user?.username?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-xs text-zinc-300">{m.user?.username}</span>
                                                <RoleIcon className={clsx('w-3 h-3', ROLE_COLORS[m.role])}/>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* {Chat} */}
                            <div className="card p-0 overflow-hidden" style={{height:'420px'}}>
                                <WorkspaceChat project={active}/>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCreate && <CreateModal onClose={() => setShowCreate(false)}/>}
            {showJoin && <JoinModal onClose={() => setShowJoin(false)}/>}
        </div>
    )
}