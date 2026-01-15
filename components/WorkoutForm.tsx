
import React, { useState, useEffect } from 'react';
import { Workout, Exercise, ExerciseType, WorkoutExercise, Set, RunningLog, Routine } from '../types';
import { dbService } from '../db';

interface WorkoutFormProps {
  initialWorkout: Workout | null;
  availableExercises: Exercise[];
  onCancel: () => void;
  onSave: (workout: Partial<Workout>, weData: any[]) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ initialWorkout, availableExercises, onCancel, onSave }) => {
  const [date, setDate] = useState(initialWorkout?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(initialWorkout?.notes || '');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | undefined>(initialWorkout?.routine_id);
  const [selectedExercises, setSelectedExercises] = useState<any[]>(
    initialWorkout?.workout_exercises?.map(we => ({
      exercise_id: we.exercise_id,
      type: we.exercise?.type,
      name: we.exercise?.name,
      sets: we.sets?.map(s => ({ reps: s.reps, weight_kg: s.weight_kg })) || [],
      running_log: we.running_log ? { ...we.running_log } : null
    })) || []
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showRoutineSelector, setShowRoutineSelector] = useState(!initialWorkout && selectedExercises.length === 0);

  useEffect(() => {
    setRoutines(dbService.getRoutines());
  }, []);

  const addExerciseFromId = (exId: string) => {
    const ex = availableExercises.find(e => e.id === exId);
    if (!ex) return;

    const lastPerf = dbService.getLastPerformance(exId);

    return {
      exercise_id: ex.id,
      type: ex.type,
      name: ex.name,
      sets: ex.type === ExerciseType.GYM
        ? (lastPerf?.sets.map(s => ({ reps: s.reps, weight_kg: s.weight_kg })) || [{ reps: 0, weight_kg: 0 }])
        : [],
      running_log: ex.type === ExerciseType.RUNNING
        ? (lastPerf?.running_log ? { ...lastPerf.running_log } : { distance_km: 0, time_minutes: 0, avg_heart_rate: 0 })
        : null
    };
  };

  const handleSelectRoutine = (routine: Routine) => {
    const newExs = routine.exercise_ids.map(id => addExerciseFromId(id)).filter(Boolean);
    setSelectedExercises(newExs);
    setSelectedRoutineId(routine.id);
    setShowRoutineSelector(false);
  };

  const handleManualExercise = (ex: Exercise) => {
    const newEntry = addExerciseFromId(ex.id);
    if (newEntry) {
      setSelectedExercises([...selectedExercises, newEntry]);
    }
    setIsSelectorOpen(false);
  };

  const removeExercise = (idx: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== idx));
  };

  const updateSet = (weIdx: number, sIdx: number, field: keyof Set, val: string) => {
    const newExs = [...selectedExercises];
    newExs[weIdx].sets[sIdx][field] = Number(val);
    setSelectedExercises(newExs);
  };

  const addSet = (weIdx: number) => {
    const newExs = [...selectedExercises];
    const lastSet = newExs[weIdx].sets[newExs[weIdx].sets.length - 1];
    newExs[weIdx].sets.push({
      reps: lastSet?.reps || 0,
      weight_kg: lastSet?.weight_kg || 0
    });
    setSelectedExercises(newExs);
  };

  const updateRunning = (weIdx: number, field: string, val: string) => {
    const newExs = [...selectedExercises];
    newExs[weIdx].running_log[field] = Number(val);
    setSelectedExercises(newExs);
  };

  return (
    <div className="space-y-6 pb-32">
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 py-2 z-10 px-1">
        <h1 className="text-2xl font-bold text-slate-900">{initialWorkout ? 'Editar' : 'Nueva Sesión'}</h1>
        <button onClick={onCancel} className="text-rose-500 font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-full">CANCELAR</button>
      </header>

      {showRoutineSelector && (
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4 animate-in fade-in duration-300">
          <h2 className="text-indigo-900 font-bold text-center">Selecciona una rutina</h2>
          <div className="grid grid-cols-1 gap-3">
            {routines.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelectRoutine(r)}
                className="w-full bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 text-indigo-700 font-bold text-left flex justify-between items-center active:scale-[0.98] transition-all"
              >
                <div>
                  <div className="text-lg">{r.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal uppercase mt-1">{r.exercise_ids.length} ejercicios</div>
                </div>
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              </button>
            ))}
            <button
              onClick={() => { setShowRoutineSelector(false); setSelectedRoutineId(undefined); }}
              className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all"
            >
              Empezar sesión libre
            </button>
          </div>
        </div>
      )}

      {!showRoutineSelector && (
        <>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Fecha</label>
              <input
                type="date"
                className="w-full p-3 rounded-xl bg-slate-50 border-none text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Notas</label>
              <textarea
                className="w-full p-3 rounded-xl bg-slate-50 border-none text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500"
                rows={2}
                placeholder="¿Cómo te sentiste hoy?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {selectedExercises.map((we, weIdx) => (
              <div key={weIdx} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-700 uppercase">{we.name}</span>
                  <button onClick={() => removeExercise(weIdx)} className="text-rose-400 p-1 bg-white rounded-full shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="p-5">
                  {we.type === ExerciseType.GYM ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase px-1">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-5 text-center">Peso (kg)</div>
                        <div className="col-span-5 text-center">Reps</div>
                      </div>
                      {we.sets.map((s: any, sIdx: number) => (
                        <div key={sIdx} className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-2 text-center text-xs font-bold text-slate-300">{sIdx + 1}</div>
                          <input
                            type="number" step="0.5"
                            className="col-span-5 p-3 rounded-xl bg-slate-50 text-center text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500"
                            value={s.weight_kg === 0 ? '' : s.weight_kg}
                            placeholder="kg"
                            onChange={(e) => updateSet(weIdx, sIdx, 'weight_kg', e.target.value)}
                          />
                          <input
                            type="number"
                            className="col-span-5 p-3 rounded-xl bg-slate-50 text-center text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500"
                            value={s.reps === 0 ? '' : s.reps}
                            placeholder="reps"
                            onChange={(e) => updateSet(weIdx, sIdx, 'reps', e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addSet(weIdx)}
                        className="w-full py-3 border-2 border-dashed border-indigo-100 rounded-2xl text-indigo-500 text-xs font-bold active:bg-indigo-50 transition-colors"
                      >
                        + AÑADIR SERIE
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Dist. (km)</label>
                        <input
                          type="number" step="0.1"
                          className="w-full p-3 rounded-xl bg-slate-50 text-center text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500"
                          value={we.running_log.distance_km === 0 ? '' : we.running_log.distance_km}
                          onChange={(e) => updateRunning(weIdx, 'distance_km', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tiempo (min)</label>
                        <input
                          type="number"
                          className="w-full p-3 rounded-xl bg-slate-50 text-center text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500"
                          value={we.running_log.time_minutes === 0 ? '' : we.running_log.time_minutes}
                          onChange={(e) => updateRunning(weIdx, 'time_minutes', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Puls.</label>
                        <input
                          type="number"
                          className="w-full p-3 rounded-xl bg-slate-50 text-center text-sm font-bold border-none focus:ring-2 focus:ring-indigo-500"
                          value={we.running_log.avg_heart_rate === 0 ? '' : we.running_log.avg_heart_rate}
                          onChange={(e) => updateRunning(weIdx, 'avg_heart_rate', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsSelectorOpen(true)}
            className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 active:bg-slate-50 transition-all mt-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            AÑADIR OTRO EJERCICIO
          </button>
        </>
      )}

      {/* Exercise Selector Modal */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end">
          <div className="bg-white w-full max-h-[85vh] rounded-t-[40px] p-8 space-y-4 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Elegir Ejercicio</h3>
              <button onClick={() => setIsSelectorOpen(false)} className="p-3 bg-slate-100 rounded-full text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 pb-8">
              {availableExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleManualExercise(ex)}
                  className="w-full text-left p-5 bg-slate-50 rounded-2xl font-bold text-slate-700 active:bg-indigo-50 active:text-indigo-600 transition-all flex justify-between items-center"
                >
                  <span>{ex.name}</span>
                  <span className={`text-[9px] px-2 py-1 rounded-full uppercase ${ex.type === 'gym' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {ex.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FIXED SAVE BUTTON */}
      {!showRoutineSelector && selectedExercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 max-w-lg mx-auto pb-8 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => onSave({
              id: initialWorkout?.id,
              date,
              notes,
              routine_id: selectedRoutineId // Guardamos la vinculación a la rutina
            }, selectedExercises)}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            Finalizar Entreno
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkoutForm;
