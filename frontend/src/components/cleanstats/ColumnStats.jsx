import { useState } from "react";
import clsx from "clsx";
import { Flashlight } from "lucide-react";

function StatPill({ label, value, color = 'text-zinc-300' }){
    return (
        <div className="flex flex-col">
            <span className="text-xs text-zinc-600">{label}</span>
            <span className={`text-xs font-mono font-medium ${color}`}>{value ?? '—'}</span>
        </div>
    )
}

function ColRow({ col, index }){
    const [expanded, setExpanded] = useState(false)
    const isNum = col.dtype !== 'object'

    return (
        <div className={clsx('border-b border-white/5 last:border-0', expanded && 'bg-white/2')}>
            {/* {Row header} */}
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-all text-left"
            >
                <span className="text-xs text-zinc-600 w-6 shrink-0">{index + 1}</span>
                <span className="text-sm font-mono text-zinc-200 flex-1 truncate">{col.name}</span>
                <span className={clsx(
                    'text-xs px-1.5 py-0.5 rounded font-mono shrink-0',
                    isNum ? 'bg-brand-500/10 text-brand-400' : 'bg-violet-500/10 text-violet-400'
                )}>
                    {col.dtype}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                    {col.null_pct > 0 && (
                        <span className="text-xs text-amber-400">{col.null_pct}% null</span>
                    )}
                    <span className="text-xs text-zinc-600">{col.unique_count} unique</span>
                </div>
            </button>

            {/* {Expanded detail} */}
            {expanded && (
                <div className="px-4 pb-4 pt-1">
                    {isNum ? (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 card">
                            <StatPill label="mean" value={col.mean} color="text-brand-400"/>
                            <StatPill label="median" value={col.median} color="text-brand-300"/>
                            <StatPill label="std" value={col.std} color="text-zinc-400"/>
                            <StatPill label="min" value={col.min} color="text-sky-400"/>
                            <StatPill label="max" value={col.max} color="text-violet-400"/>
                        </div>
                    ) : (
                        <div className="card">
                            <p className="text-xs text-zinc-600 mb-2">Top values</p>
                            <div className="space-y-1.5">
                                {Object.entries(col.top_values ?? {}).map(([val, count]) => {
                                    const total = Object.values(col.top_values).reduce((a,b) => a + b, 0)
                                    const pct = Math.round((count / total) * 100)
                                    return (
                                        <div key={val} className="flex items-center gap-3">
                                            <span className="text-xs text-zinc-300 w-28 truncate font-mono">{val}</span>
                                            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-full bg-brand-500/60 rounded-full" style={{ width: `${pct}%`}}/>
                                            </div>
                                            <span className="text-xs text-zinc-500 w-12 text-right">{count}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-4 mt-2 px-1">
                        <StatPill label="nulls" value={col.null_count} color="text-amber-400"/>
                        <StatPill label="null %" value={`${col.null_pct}%`} color="text-amber-300"/>
                        <StatPill label="unique" value={col.unique_count} color="text-zinc-400"/>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ColumnStats({ columns = [] }){
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    const filtered = columns.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
        const matchFilter =
        filter === 'all' ||
        (filter === 'numeric' && c.dtype !== 'object') ||
        (filter === 'categorical' && c.dtype === 'object')
    return matchSearch && matchFilter
    })

    return (
        <div className="card p-0 overflow-hidden">
            {/* {Toolbar} */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <input
                    type="text"
                    placeholder="Search columns..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input text-xs py-1.5 flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                    {['all', 'numeric', 'categorical'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={clsx(
                                'text-xs px-3 py-1.5 rounded-lg transition-all capitalize',
                                filter === f
                                ? 'bg-brand-500/15 text-brand-400 font-medium'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* {Column rows} */}
            <div className="divide-y divide-white/5">
                {filtered.length === 0
                    ? <p className="text-xs text-zinc-600 text-center py-8">No columns match.</p>
                    : filtered.map((col, i) => <ColRow key={col.name} col={col} index={i} />)
                }
            </div>
        </div>
    )
}
