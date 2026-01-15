
import React, { useState } from 'react';
import { BodyWeightLog } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightTrackerProps {
  logs: BodyWeightLog[];
  onAdd: (w: number, d: string, n?: string) => void;
  onDelete: (id: string) => void;
}

const WeightTracker: React.FC<WeightTrackerProps> = ({ logs, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const chartData = logs.slice().reverse().map(l => ({
    date: l.date,
    weight: l.weight_kg
  }));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Peso Corporal</h1>
          <p className="text-slate-500 text-sm">Controla tu transformación</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform"
        >
          {showAdd ? 'Cerrar' : 'Añadir'}
        </button>
      </header>

      {showAdd && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Peso (kg)</label>
              <input 
                type="number" step="0.1"
                className="w-full p-3 rounded-xl bg-slate-50 border-none text-slate-800 focus:ring-2 focus:ring-indigo-500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Fecha</label>
              <input 
                type="date"
                className="w-full p-3 rounded-xl bg-slate-50 border-none text-slate-800 focus:ring-2 focus:ring-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => {
              if (weight) {
                onAdd(Number(weight), date);
                setWeight('');
                setShowAdd(false);
              }
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold"
          >
            GUARDAR REGISTRO
          </button>
        </div>
      )}

      {logs.length > 1 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" hide />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="weight" stroke="#4f46e5" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Registros Recientes</h2>
        {logs.map(log => (
          <div key={log.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50">
            <div>
              <span className="font-bold text-slate-800 text-lg">{log.weight_kg} <span className="text-sm font-normal text-slate-400">kg</span></span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">{new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <button 
              onClick={() => { if(confirm('¿Eliminar registro?')) onDelete(log.id) }}
              className="text-slate-300 hover:text-rose-500 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightTracker;
