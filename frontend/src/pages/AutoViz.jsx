import {useState} from 'react';
import {LineChart, Send, Loader2, Sparkles, RefreshCw} from 'lucide-react';
import {useFiles} from '@/hooks/useCleanStats';
import ChartRenderer from '@/components/autoviz/ChartRenderer';
import {vizService} from '@/services/vizService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUGGESTIONS = [
    'Show distribution of prices as a bar chart',
    'What is the trend over time?',
    'Compare categories by average value',
    'Show top 10 items by count',
]

export default function AutoViz(){
    const {data: files = []} = useFiles()
    const [selectedId, setSelectedId] = useState(null)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])

    const generate = async (q = query) => {
        if (!selectedId) {toast.error('Select a file first'); return}
        if (!q.trim())   {toast.error('Enter a query'); return}
        setLoading(true)
        try{
            const {data} = await vizService.generate(selectedId, q)
            setResult(data)
            const prev = parseInt(localStorage.getItem('viz_count') || '0')
            localStorage.setItem('viz_count', prev + 1)
            setHistory(p => [{query: q, result: data}, ...p.slice(0,4)])
            setQuery('')
        } catch (err) {
            toast.error(err.response?.data?.detail ?? 'Visualization failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='p-8 space-y-6 animate-fade-up'>
            {/* {Header} */}
            <div>
                <p className='text-xs text-zinc-500 font-display uppercase tracking-widest mb-1'>Feature</p>
                <h1 className='text-2xl font-display font-bold text-zinc-100'>AutoViz</h1>
                <p className='text-sm text-zinc-400 mt-1'>Describe a chart in plain English. AI generates it instantly.</p>
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
                                        onClick={() => {setSelectedId(f.id); setResult(null)}}
                                        className={clsx(
                                            'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                                            selectedId === f.id
                                                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                                                : 'text-zinc-400 hover:bg-white/5 border border-transparent'
                                        )}
                                    >
                                        <p className='font-medium truncate'>{f.original_name}</p>
                                        <p className='text-zinc-600'>{f.row_count ?? '—'} rows · {f.col_count ?? '—'} cols</p>
                                    </button>
                                ))}
                            </div>
                        }
                    </div>

                    {/* {Suggestions} */}
                    <div className='card'>
                        <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>Suggestions</p>
                        <div className='space-y-1.5'>
                            {SUGGESTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => generate(s)}
                                    disabled={!selectedId || loading}
                                    className='w-full text-left text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-3 py-2 rounded-lg transition-all disabled:opacity-40'
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* {History} */}
                    {history.length > 0 && (
                        <div className='card'>
                            <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>History</p>
                            <div className='space-y-1.5'>
                                {history.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setResult(h.result)}
                                        className='w-full text-left text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/5 px-3 py-2 rounded-lg transition-all truncate'
                                    >
                                        {h.query}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* {Right - chart area} */}
                <div className='lg:col-span-2 space-y-4'>
                    {/* {Query input} */}
                    <div className='card flex items-center gap-3'>
                        <Sparkles className='w-4 h-4 text-brand-400 shrink-0'/>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generate()}
                            placeholder='Describe the chart you want...'
                            className='flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none'
                        />
                        <button
                            onClick={() => generate()}
                            disabled={loading || !selectedId}
                            className='btn-primary px-4 py-2 flex items-center gap-2'
                        >
                            {loading
                                ? <Loader2 className='w-4 h-4 animate-spin'/>
                                :  <Send className='w-4 h-4'/>
                            }
                        </button>
                    </div>

                    {/* {Chart} */}
                    {loading ? (
                        <div className='card flex items-center justify-center py-20'>
                            <div className='text-center space-y-3'>
                                <Loader2 className='w-8 h-8 text-brand-400 animate-spin mx-auto'/>
                                <p className='text-xs text-zinc-500'>Generating chart...</p>
                            </div>
                        </div>
                    ) : result ? (
                        <>
                            <div className='card'>
                                <ChartRenderer config={result.config} data={result.data}/>
                            </div>

                            {/* {Config info} */}
                            <div className='card'>
                                <p className='text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest mb-3'>Chart Config</p>
                                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                    {[
                                        ['Type', result.config.chart_type],
                                        ['X Column', result.config.x_column],
                                        ['Y Column', result.config.y_column ?? '-'],
                                        ['Aggregation', result.config.aggregation],
                                        ['Sort', result.config.sort_by],
                                        ['Limit', result.config.limit],
                                    ].map(([k, v]) => (
                                        <div key={k}>
                                            <p className='text-xs text-zinc-600'>{k}</p>
                                            <p className='text-xs font-mono text-zinc-300'>{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='card flex flex-col items-center justify-center py-20 text-center'>
                            <LineChart className='w-10 h-10 text-zinc-700 mb-3'/>
                            <p className='text-sm text-zinc-500'>Select a file and describe your chart</p>
                            <p className='text-xs text-zinc-700 mt-1'>e.g. "Show sales by city as a bar chart"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
