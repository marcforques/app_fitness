
import React, { useState } from 'react';
import { Workout, ExerciseType, Routine } from '../types';
import { formatDate } from '../utils';

interface HistoryProps {
  workouts: Workout[];
  routines: Routine[];
  onEdit: (w: Workout) => void;
  onDelete: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ workouts, routines, onEdit, onDelete }) => {
  const [filterRoutineId, setFilterRoutineId] = useState<string>('all');

  const filteredWorkouts = filterRoutineId === 'all' 
    ? workouts 
    : workouts.filter(w => w.routine_id === filterRoutineId);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial</h1>
          <p className="text-slate-500 text-sm">Tu camino recorrido</p>
        </div>

        {/* Routine Filter Dropdown */}
        <div className="relative">
          <label htmlFor="routine-filter" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block px-1">
            Filtrar por rutina
          </label>
          <div className="relative">
            <select
              id="routine-filter"
              value={filterRoutineId}
              onChange={(e) => setFilterRoutineId(e.target.value)}
              className="w-full p-3 pl-4 pr-10 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold appearance-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="all">Todos los entrenamientos</option>
              <option value="free" disabled>— Sesiones —</option>
              {routines.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
              <option value="" className="text-slate-400 italic">Sesiones libres</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {filteredWorkouts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 animate-in fade-in duration-300">
          <p className="text-slate-400 italic">No se encontraron entrenamientos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkouts.map((workout) => {
            const routineName = routines.find(r => r.id === workout.routine_id)?.name;
            
            return (
              <div key={workout.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">{formatDate(workout.date)}</h3>
                      {routineName && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase border border-indigo-100">
                          {routineName}
                        </span>
                      )}
                    </div>
                    {workout.notes && <p className="text-xs text-slate-400 mt-1 italic">"{workout.notes}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(workout)} className="p-2 text-indigo-600 bg-indigo-50 rounded-xl active:scale-90 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => { if(confirm('¿Borrar entreno?')) onDelete(workout.id) }} className="p-2 text-rose-500 bg-rose-50 rounded-xl active:scale-90 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-slate-50 pt-3 mt-3">
                  {workout.workout_exercises?.map((we) => (
                    <div key={we.id} className="text-xs flex justify-between items-center text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${we.exercise?.type === ExerciseType.GYM ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                        <span className="font-semibold">{we.exercise?.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {we.exercise?.type === ExerciseType.GYM 
                          ? `${we.sets?.length} series` 
                          : `${we.running_log?.distance_km} km`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
