import { X } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';

const COLORS = ['#27a268', '#49be85', '#7dd8aa', '#a78bfa', '#38bdf8', '#f59e0b', '#f87171']

const TOOLTIP_STYLE ={
    contentStyle: {background: '#111613', border: '1px solid rgba(255,255,255,0.06', borderRadius: 8, fontSize: 12},
    labelStyle: {color: '#a1a1aa'},
    itemStyle: {color: '#e4e4e7'},
}

export default function ChartRenderer({ config, data}){
    if (!config || !data?.length) return (
        <div className='flex items-center justify-center h-64 text-zinc-600 text-sm'>No chart data</div>
    )

    const {chart_type, x_column, y_column, title} = config
    const common = {data, margin: {top:10, right: 20, left: 0, bottom: 40}}
    const axis = (
        <>
            <CartesianGrid strokeDasharray="3 3" stroke='rgba(255,255,255,0.04)'/>
            <XAxis dataKey={x_column} tick={{fill: '#71717a', fontSize: 11}} tickLine={false} axisLine={false} angle={-30} textAnchor='end'/>
            <YAxis tick={{fill: '#71717a', fontSize: 11}} tickLine={false} axisLine={false}/>
            <Tooltip {...TOOLTIP_STYLE}/>
        </>
    )

    const renderChart = () => {
        switch (chart_type) {
            case 'bar':
                return (
                    <BarChart {...common}>
                        {axis}
                        <Bar dataKey={y_column} fill='#27a268' radius={[4,4,0,0]}/>
                    </BarChart>
                )
            
            case 'line':
                return (
                    <LineChart {...common}>
                        {axis}
                        <Line type="monotone" dataKey={y_column} stroke='#27a268' strokeWidth={2} dot={false}/>
                    </LineChart>
                )
            
            case 'area':
                return (
                    <AreaChart {...common}>
                        {axis}
                        <defs>
                            <linearGradient id='areaGrad' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#27a268' stopOpacity={0.3}/>
                                <stop offset='95%' stopColor='#27a268' stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type='monotone' dataKey={y_column} stroke='#27a268' fill='url(#areaGrad)' strokeWidth={2}/>
                    </AreaChart>
                )
            
            case 'scatter':
                return (
                    <ScatterChart {...common}>
                        {axis}
                        <Scatter dataKey={y_column} fill='#27a268'/>
                    </ScatterChart>
                )
            
            case 'pie':
                const pieKey = y_column || "value"
                return (
                    <PieChart>
                        <Pie data={data} dataKey={pieKey} nameKey={x_column} cx="50%" cy="50%" outerRadius={110} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{fontSize: 11, color: '#71717a'}}/>
                    </PieChart>
                )
            
            case 'histogram':
                return (
                    <BarChart {...common}>
                        {axis}
                        <Bar dataKey={x_column} fill='#27a268' radius={[4,4,0,0]}/>
                    </BarChart>
                )

            default:
                return (
                    <BarChart {...common}>
                        {axis}
                        <Bar dataKey={y_column} fill='#27a268' radius={[4,4,0,0]}/>
                    </BarChart>
                )
        }
    }

    return (
        <div className='space-y-3'>
            {title && <p className='text-sm font-display font-semibold text-zinc-200'>{title}</p>}
            <ResponsiveContainer width="100%" height={320}>
                {renderChart()}
            </ResponsiveContainer>
            {config.reasoning && (
                <p className='text-xs text-zinc-600 italic'>{config.reasoning}</p>
            )}
        </div>
    )
}
