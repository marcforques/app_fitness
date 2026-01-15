
import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { BodyWeightLog, Exercise, Workout, ExerciseType } from '../types';
import { calculate1RM } from '../utils';

interface ProgressChartProps {
    type: 'weight' | 'exercise';
    data: BodyWeightLog[] | Workout[]; // Simplified prop type for now
    exerciseId?: string;
    title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
                <p className="text-xs text-slate-500 mb-1">{new Date(label).toLocaleDateString()}</p>
                <p className="text-sm font-bold text-indigo-600">
                    {payload[0].value} {payload[0].unit || 'kg'}
                </p>
            </div>
        );
    }
    return null;
};

const ProgressChart: React.FC<ProgressChartProps> = ({ type, data, exerciseId, title }) => {
    const chartData = React.useMemo(() => {
        if (type === 'weight') {
            const logs = data as BodyWeightLog[];
            return logs
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(log => ({
                    date: log.date,
                    value: log.weight_kg,
                }));
        } else if (type === 'exercise' && exerciseId) {
            const workouts = data as Workout[];
            const history: { date: string, value: number }[] = [];

            workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .forEach(w => {
                    const we = w.workout_exercises?.find(e => e.exercise_id === exerciseId);
                    if (we && we.sets && we.sets.length > 0) {
                        const max1RM = Math.max(...we.sets.map(s => calculate1RM(s.weight_kg, s.reps)));
                        history.push({
                            date: w.date,
                            value: Math.round(max1RM)
                        });
                    }
                });
            return history;
        }
        return [];
    }, [type, data, exerciseId]);

    if (chartData.length < 2) {
        return (
            <div className="h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Insuficientes datos para gráfica</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 ml-2">{title}</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            hide={true}
                            domain={['dataMin - 2', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;
