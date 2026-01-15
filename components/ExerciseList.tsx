
import React, { useState } from 'react';
import { Exercise, ExerciseType, Workout } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculate1RM } from '../utils';

interface ExerciseListProps {
  exercises: Exercise[];
  workouts: Workout[];
  onAdd: (name: string, type: ExerciseType) => void;
  onDelete: (id: string) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, workouts, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExerciseType>(ExerciseType.GYM);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const getExerciseData = (exId: string) => {
    const data: any[] = [];
    workouts.slice().reverse().forEach(w => {
      const we = w.workout_exercises?.find(we => we.exercise_id === exId);
      if (we) {
        if (we.exercise?.type === ExerciseType.GYM) {
          const max1RM = we.sets?.reduce((max, s) => {
            const val = calculate1RM(s.weight_kg, s.reps);
            return val > max ? val : max;
          }, 0);
          data.push({ date: w.date, value: Math.round(max1RM || 0) });
        } else if (we.exercise?.type === ExerciseType.RUNNING && we.running_log) {
          data.push({ date: w.date, value: we.running_log.distance_km });
        }
      }
    });
    return data;
  };

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Ejercicios</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white p-2 rounded-full shadow-md active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg space-y-3 animate-in slide-in-from-top-4 duration-300">
          <input 
            className="w-full p-3 rounded-xl bg-slate-50 border-none text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="Nombre del ejercicio..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex gap-2">
            {(Object.values(ExerciseType)).map((type) => (
              <button
                key={type}
                onClick={() => setNewType(type as ExerciseType)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  newType === type ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {type === 'gym' ? 'Fuerza' : 'Running'}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              if (newName.trim()) {
                onAdd(newName, newType);
                setNewName('');
                setShowForm(false);
              }
            }}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            GUARDAR EJERCICIO
          </button>
        </div>
      )}

      {selectedEx ? (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
           <button 
            onClick={() => setSelectedEx(null)}
            className="mb-4 flex items-center gap-1 text-slate-500 text-xs font-medium uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver
          </button>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedEx.name}</h2>
          <p className="text-xs text-slate-400 mb-6 uppercase">{selectedEx.type === 'gym' ? 'Progreso 1RM (Estimado)' : 'Distancia Acumulada (km)'}</p>
          
          <div className="h-48 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getExerciseData(selectedEx.id)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <button 
            onClick={() => { if(confirm('¿Seguro? Se borrarán datos asociados.')) { onDelete(selectedEx.id); setSelectedEx(null); } }}
            className="w-full py-2 text-rose-500 text-xs font-bold border border-rose-100 rounded-xl"
          >
            ELIMINAR EJERCICIO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {exercises.map(ex => (
            <button 
              key={ex.id}
              onClick={() => setSelectedEx(ex)}
              className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${ex.type === 'gym' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <span className="font-semibold text-slate-700">{ex.name}</span>
              </div>
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
