import { useState } from 'react';
import { Download, Sparkles, Wand2, AlertTriangle, Loader2, RefreshCw, Bluetooth } from 'lucide-react';
import FileUpload from '@/components/cleanstats/FileUpload';
import StatsOverview from '@/components/cleanstats/StatsOverview'
import ColumnStats from '@/components/cleanstats/ColumnStats';
import { useStats, useCleanStatsMutation } from '@/hooks/useCleanStats';
import { cleanService } from '@/services/cleanService';
import toast from 'react-hot-toast';

export default function CleanStats() {
    const [selectedId, setSelectedId] = useState(null)
    const [cleanResult, setCleanResult] = useState(null)
    const [opts, setOpts] = useState({ removeOutliers: false, insights: false })
    const [activeTab, setActiveTab] = useState('overview')

    const {data: basicStats, isLoading: statsLoading} = useStats(selectedId)
    const cleanMutation = useCleanStatsMutation()

    const stats = cleanResult ?? basicStats

    const runClean = async () => {
        if (!selectedId) return
        try {
            const res = await cleanService.getCleanStats(selectedId, opts)
            setCleanResult(res.data)
            setActiveTab('overview')
            toast.success('Cleaning complete')
        } catch (err) {
            toast.error(err.response?.data?.detail ?? 'Cleaning failed')
        }
    }

    const handleDownload = async () => {
        if (!cleanResult?.cleaned_file_name) return
        try{
            const res = await cleanService.downloadCleaned(selectedId, cleanResult.cleaned_file_name)
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = cleanResult.cleaned_file_name
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            toast.error('Download failed')
        }
    }

    const TABS = [
        { id: 'overview', label: 'Overview'},
        { id: 'columns', label: `Column${stats ? ` (${stats.col_count})` : ''}`},
        ...(cleanResult?.insights ? [{id: 'insights', label: 'AI Insights' }] : []),
    ]

    return (
        <div className='p-8 space-y-6 animate-fade-up'>
            {/* {Header} */}
            <div>
                <p className='text-xs text-zinc-500 font-display uppercase tracking-widest mb-1'>Feature</p>
                <h1 className='text-2xl font-display font-bold text-zinc-100'>CleanStats</h1>
                <p className='text-sm text-zinc-400 mt-1'>Auto-clean datasets, analyse statistics, generate AI insights.</p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* {Left - file panel} */}
                <div className='space-y-4'>
                    <div className='card'>
                        <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-4'>Files</p>
                        <FileUpload selectedId={selectedId} onSelect={id => {setSelectedId(id); setCleanResult(null) }}/>
                    </div>

                    {/* {Clean Options} */}
                    {selectedId && (
                        <div className='card space-y-4'>
                            <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest'>Clean Options</p>
                            <label className='flex items-center justify-between cursor-pointer'>
                                <div>
                                    <p className='text-sm text-zinc-300'>Remove Outliers</p>
                                    <p className='text-xs text-zinc-600'>Drop IQR-detected outlier rows</p>
                                </div>
                                <button
                                    onClick={() => setOpts(p => ({...p, removeOutliers: !p.removeOutliers }))}
                                    className={`w-9 h-5 rounded-full transition-colors ${opts.removeOutliers ? 'bg-brand-500' : 'bg-white/10'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${opts.removeOutliers ? 'translate-x-4' : 'translate-x-0'}`}/>
                                </button>
                            </label>

                            <label className='flex items-center justify-between cursor-pointer'>
                                <div>
                                    <p className='text-sm text-zinc-300'>AI Insights</p>
                                    <p className='text-xs text-zinc-600'>Generate NL insights via AI</p>
                                </div>
                                <button onClick={() => setOpts(p => ({ ...p, insights: !p.insights }))}
                                    className={`w-9 h-5 rounded-full transition-colors ${opts.insights ? 'bg-brand-500' : 'bg-white/10'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${opts.insights ? 'translate-x-4' : 'translate-x-0'}`}/>
                                </button>
                            </label>

                            <button
                                onClick={runClean}
                                disabled={cleanMutation.isPending}
                                className='btn-primary w-full flex items-center justify-center gap-2'
                            >
                                {cleanMutation.isPending
                                    ? <><Loader2 className='w-4 h-4 animate-spin'/> Cleaning...</>
                                    : <><Wand2 className='w-4 h-4'/> Run Cleaning</>
                                }
                            </button>

                            {cleanResult?.cleaned_file_name && (
                                <button
                                    onClick={handleDownload}
                                    className='btn-ghost w-full flex items-center justify-center gap-2 border border-white/10 rounded-xl'
                                >
                                    <Download className='w-4 h-4'/> Download Cleaned
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* {Right - stats panel} */}
                <div className='lg:col-span-2'>
                    {!selectedId ? (
                        <div className='card flex flex-col items-center justify-center py-20 text-center'>
                            <Sparkles className='w-8 h-8 text-zinc-700 mb-3'/>
                            <p className='text-sm text-zinc-500'>Select or upload a file to view stats</p>
                        </div>
                    ) : statsLoading ? (
                        <div className='card flex items-center justify-center py-20'>
                            <Loader2 className='w-6 h-6 text-brand-400 animate-spin'/>
                        </div>
                    ) : stats ? (
                        <div className='space-y-4'>
                            {/* {Tabs} */}
                            <div className='flex items-center gap-1 bg-surface-800 border border-white/5 rounded-xl p-1 w-fit'>
                                {TABS.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTab(t.id)}
                                        className={`text-xs px-4 py-2 rounded-lg transition-all font-display font-medium ${
                                            activeTab === t.id
                                            ? 'bg-brand-500/20 text-brand-400'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                            
                            {/* {Tab Content} */}
                            {activeTab === 'overview' && (
                                <StatsOverview
                                    stats={stats}
                                    cleaningSummary={cleanResult?.cleaning_summary}
                                    beforeAfter={cleanResult?.before_after}
                                />
                            )}

                            {activeTab === 'columns' && (
                                <ColumnStats columns={stats.columns} />
                            )}

                            {activeTab === 'insights' && cleanResult?.insights && (
                                <div className='card space-y-4'>
                                    <div className='flex items-center gap-2'>
                                        <Sparkles className='w-4 h-4 text-brand-400'/>
                                        <p className='text-sm font-display font-semibold text-zinc-200'>AI Insights</p>
                                    </div>
                                    <div className='space-y-3'>
                                        {cleanResult.insights
                                            .split(/\n/)
                                            .filter(line => line.trim())
                                            .map((line, i) => {
                                                const clean = line.replace(/^\d+[\.\)]\s*/, '').trim()
                                                if (!clean) return null
                                                return (
                                                    <div key={i} className='flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5'>
                                                        <div className='w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5'>
                                                            <span className='text-xs font-display font-bold text-brand-400'>{i + 1}</span>
                                                        </div>
                                                        <p className='text-sm text-zinc-400 leading-relaxed'>{clean}</p>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* {Sample rows} */}
                            {activeTab === 'overview' && stats.sample_rows?.length > 0 && (
                                <div className='card p-0 overflow-hidden'>
                                    <div className='px-4 py-3 border-b border-white/5'>
                                        <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest'>Sample Rows (5)</p>
                                    </div>
                                    <div className='overflow-x-auto scrollbar-thin'>
                                        <table className='w-full text-xs'>
                                            <thead>
                                                <tr className='border-b border-white/5'>
                                                    {Object.keys(stats.sample_rows[0]).map(k => (
                                                        <th key={k} className='px-4 py-2 text-left text-zinc-500 font-mono font-normal whitespace-nowrap'>{k}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.sample_rows.map((row, i) => (
                                                    <tr key={i} className='border-b border-white/5 last:border-0 hover:bg-white/20'>
                                                        {Object.values(row).map((v, j) => (
                                                            <td key={j} className='px-4 py-2 text-zinc-400 font-mono whitespace-nowrap'>
                                                                {v === null ? <span className='text-zinc-700'>null</span> : String(v)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}