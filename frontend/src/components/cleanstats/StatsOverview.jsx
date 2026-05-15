import { Rows3, Columns3, AlertTriangle, Copy, TrendingDown } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-400'}){
    return (
        <div className="card flex items-start gap-4">
            <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4"/>
            </div>
            <div>
                <p className="text-xl font-display font-bold text-zinc-100">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
                {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

export default function StatsOverview({ stats, cleaningSummary, beforeAfter }){
    return (
        <div className="space-y-4">
            {/* {Core stats} */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Rows3} label="Rows" value={stats.row_count.toLocaleString()} color="text-brand-400"/>
                <StatCard icon={Columns3} label="Columns" value={stats.col_count} color="text-violet-400"/>
                <StatCard icon={AlertTriangle} label="Missing cells" value={stats.missing_cells} sub={`${stats.missing_pct}%`} color="text-amber-400"/>
                <StatCard icon={Copy} label="Duplicate rows" value={stats.duplicate_rows} color="text-red-400"/>
            </div>
            
            {/* {Before/After} */}
            {beforeAfter && (
                <div className="card">
                    <p className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4">Before / After Cleaning</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {label: 'Rows', before: beforeAfter.rows.before, after: beforeAfter.rows.after},
                            {label: 'Missing', before: beforeAfter.missing_cells.before, after: beforeAfter.missing_cells.after},
                            {label: 'Duplicates', before: beforeAfter.duplicates.before, after: beforeAfter.duplicates.after},
                            {label: 'Memory (KB)', before: beforeAfter.memory_kb.before, after: beforeAfter.memory_kb.after},
                        ].map(({label, before, after}) => (
                            <div key={label}>
                                <p className="text-xs text-zinc-500 mb-1">{label}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-zinc-400 line-through">{before}</span>
                                    <TrendingDown className="w-3 h-3 text-brand-400"/>
                                    <span className="text-sm font-medium text-brand-400">{after}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* {Cleaning summary} */}
            {cleaningSummary && (
                <div className="card">
                    <p className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4">Cleaning Summary</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-400"/>
                            <span className="text-zinc-400">Dupes removed:</span>
                            <span className="text-zinc-100 font-medium">{cleaningSummary.duplicates_removed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-400"/>
                            <span className="text-zinc-400">Nulls filled:</span>
                            <span className="text-zinc-100 font-medium">{cleaningSummary.missing_filled}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400"/>
                            <span className="text-zinc-400">Outlier cols:</span>
                            <span className="text-zinc-100 font-medium">{Object.keys(cleaningSummary.outliers_detected).length}</span>
                        </div>
                        {cleaningSummary.dtype_fixes.length > 0 && (
                            <div className="flex items-center gap-2 col-span-2">
                                <span className="w-2 h-2 rounded-full bg-sky-400"/>
                                <span className="text-zinc-400">Dtype fixes:</span>
                                <span className="text-zinc-100 font-medium">{cleaningSummary.dtype_fixes.join(',')}</span>
                            </div>
                        )}
                    </div>

                    {/* {Outlier detail} */}
                    {Object.keys(cleaningSummary.outliers_detected).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-xs text-zinc-500 mb-2">Outliers detected</p>
                            <div className="space-y-1">
                                {Object.entries(cleaningSummary.outliers_detected).map(([col, info]) => (
                                    <div key={col} className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-300 font-mono">{col}</span>
                                        <span className="text-amber-400">{info.count} rows ({info.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
