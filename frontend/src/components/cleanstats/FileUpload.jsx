import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X, Loader2, Trash2 } from 'lucide-react';
import { useFiles, useUploadFile, useDeleteFile } from '@/hooks/useCleanStats';
import clsx from 'clsx';

export default function FileUpload({ selectedId, onSelect}){
    const [dragging, setDragging] = useState(false)
    const { data: files = [], isLoading} = useFiles()
    const upload = useUploadFile()
    const del = useDeleteFile()

    const handleDrop = useCallback(e => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) upload.mutate(file)
    }, [upload])

    const handleChange = e => {
        const file = e.target.files[0]
        if (file) upload.mutate(file)
    }

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <label
                onDragOver={e => {e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={clsx(
                    'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200',
                    dragging
                        ? 'border-brand-400 bg-brand-500/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/2'
                )}
            >
                {upload.isPending
                    ? <Loader2 className="w-8 h-8 text-brand-400 animate-spin"/>
                    : <Upload className={clsx('w-8 h-8', dragging ? 'text-brand-400' : 'text-zinc-600')} />
                }
                <div className="text-center">
                    <p className="text-sm font-display font-medium text-zinc-300">
                        {upload.isPending ? 'Uploading...' : 'Drop CSV or XLSX here'}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">or click to browse</p>
                </div>
                <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={handleChange}/>
            </label>

            {/* File list */}
            {isLoading
                ? <div className="flex items-center gap-2 text-zinc-500 text-sm"><Loader2 className="w-4 h-4 animate-spin"/>Loading files...</div>
                : files.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-display font-semibold text-zinc-500 uppercase tracking-widest">Your files</p>
                        {files.map(f => (
                            <div
                                key={f.id}
                                onClick={() => onSelect(f.id)}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group',
                                    selectedId === f.id
                                        ? 'bg-brand-500/15 border border-brand-500/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                )}
                            >
                                <FileSpreadsheet className={clsx('w-4 h-4 shrink-0', selectedId === f.id ? 'text-brand-400':'text-zinc-500')}/>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-200 truncate">{f.original_name}</p>
                                    <p className="text-xs text-zinc-600">
                                        {f.row_count ?? '—'} rows · {f.file_size_kb}
                                    </p>
                                </div>
                                <button
                                    onClick={e => {e.stopPropagation(); del.mutate(f.id) }}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    )
}