
import React, { useState } from 'react';
import { Routine, Exercise, Workout, ExerciseType } from '../types';
import { formatDate } from '../utils';

interface RoutineListProps {
  routines: Routine[];
  availableExercises: Exercise[];
  workouts: Workout[];
  onAdd: (name: string, exIds: string[]) => void;
  onDelete: (id: string) => void;
}

const RoutineList: React.FC<RoutineListProps> = ({ routines, availableExercises, workouts, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [selectedExIds, setSelectedExIds] = useState<string[]>([]);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  const toggleEx = (id: string) => {
    setSelectedExIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getWorkoutsForRoutine = (routineId: string) => {
    return workouts
      .filter(w => w.routine_id === routineId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5);
  };

  const getBestPerformance = (workout: Workout, exerciseId: string) => {
    const we = workout.workout_exercises?.find(e => e.exercise_id === exerciseId);
    if (!we) return '-';

    if (we.exercise?.type === ExerciseType.GYM) {
      if (!we.sets || we.sets.length === 0) return '-';
      const bestSet = we.sets.reduce((prev, curr) => (curr.weight_kg > prev.weight_kg ? curr : prev), we.sets[0]);
      return bestSet ? `${bestSet.weight_kg}kg` : '-';
    } else {
      return we.running_log ? `${we.running_log.distance_km}km` : '-';
    }
  };

  const isFormValid = name.trim().length > 0 && selectedExIds.length > 0;

  const handleCreateRoutine = () => {
    if (isFormValid) {
      onAdd(name.trim(), selectedExIds);
      setName('');
      setSelectedExIds([]);
      setShowAdd(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Rutinas</h1>
          <p className="text-slate-500 text-sm">Progreso por tabla de evolución</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-2 rounded-full shadow-md transition-all ${showAdd ? 'bg-slate-200 text-slate-600 rotate-45' : 'bg-indigo-600 text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </header>

      {showAdd && (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block px-1">Nombre de la rutina</label>
            <input 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none text-slate-800 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Empuje A o Pierna"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Selecciona los ejercicios ({selectedExIds.length})</p>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 gap-2">
              {availableExercises.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => toggleEx(ex.id)}
                  className={`w-full text-left p-4 rounded-2xl text-sm font-bold transition-all flex justify-between items-center border ${
                    selectedExIds.includes(ex.id) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-200'
                  }`}
                >
                  <span>{ex.name}</span>
                  {selectedExIds.includes(ex.id) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleCreateRoutine}
            disabled={!isFormValid}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all ${
              isFormValid 
                ? 'bg-slate-900 text-white active:scale-95' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            CREAR RUTINA
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {routines.map(routine => {
          const routineWorkouts = getWorkoutsForRoutine(routine.id);
          const isExpanded = expandedRoutine === routine.id;

          return (
            <div key={routine.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden transition-all">
              <div 
                className="p-6 cursor-pointer active:bg-slate-50"
                onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{routine.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">
                      {routine.exercise_ids.length} ejercicios • {workouts.filter(w => w.routine_id === routine.id).length} sesiones
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('¿Borrar rutina?')) onDelete(routine.id); }} className="text-rose-300 hover:text-rose-500 p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-t border-slate-50 pt-4">Evolución (Últimas 5 sesiones)</h4>
                  
                  {routineWorkouts.length > 0 ? (
                    <div className="overflow-x-auto -mx-2 pb-2">
                      <table className="w-full min-w-[320px] text-left border-separate border-spacing-x-2">
                        <thead>
                          <tr>
                            <th className="p-2 text-[10px] font-bold text-slate-400 uppercase sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ejercicio</th>
                            {routineWorkouts.map(w => (
                              <th key={w.id} className="p-2 text-[10px] font-bold text-indigo-500 uppercase text-center min-w-[70px]">
                                {new Date(w.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {routine.exercise_ids.map(exId => {
                            const ex = availableExercises.find(e => e.id === exId);
                            return (
                              <tr key={exId} className="group">
                                <td className="p-2 py-3 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 transition-colors">
                                  <div className="text-xs font-bold text-slate-700 truncate max-w-[100px]">
                                    {ex?.name || 'Borrado'}
                                  </div>
                                </td>
                                {routineWorkouts.map(w => (
                                  <td key={w.id} className="p-2 text-center">
                                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 block">
                                      {getBestPerformance(w, exId)}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 italic">No hay suficientes datos. Completa entrenamientos vinculados a esta rutina para ver la progresión.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {routines.length === 0 && !showAdd && (
          <div className="text-center py-16 text-slate-400 bg-white rounded-[40px] border border-dashed border-slate-200">
            <svg className="w-12 h-12 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="italic px-6 text-sm">Crea una rutina para agrupar tus ejercicios y ver cómo evolucionan tus cargas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineList;
