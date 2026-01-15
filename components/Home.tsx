
import React from 'react';
import { Workout, Exercise, BodyWeightLog, ExerciseType } from '../types';
import { calculate1RM } from '../utils';
import ProgressChart from './ProgressChart';

interface HomeProps {
  workouts: Workout[];
  exercises: Exercise[];
  weightLogs: BodyWeightLog[];
  onNewWorkout: () => void;
  onViewExercise: (id: string) => void;
  onOpenSettings: () => void;
}

const Home: React.FC<HomeProps> = ({ workouts, exercises, weightLogs, onNewWorkout, onOpenSettings }) => {
  const lastWorkout = workouts[0];
  const lastWeight = weightLogs[0];

  // Calculate PRs
  const getPRs = () => {
    const prs: Record<string, { weight: number, name: string }> = {};
    workouts.forEach(w => {
      w.workout_exercises?.forEach(we => {
        if (we.exercise?.type === ExerciseType.GYM) {
          we.sets?.forEach(s => {
            const oneRM = calculate1RM(s.weight_kg, s.reps);
            if (!prs[we.exercise_id] || oneRM > prs[we.exercise_id].weight) {
              prs[we.exercise_id] = { weight: oneRM, name: we.exercise?.name || '?' };
            }
          });
        }
      });
    });
    return Object.values(prs).sort((a, b) => b.weight - a.weight).slice(0, 3);
  };

  const topPRs = getPRs();

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hola! 👋</h1>
          <p className="text-slate-500 text-sm">Listo para tu progreso hoy?</p>
        </div>
        <div
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold cursor-pointer hover:bg-indigo-200 transition-colors"
        >
          MP
        </div>
      </header>

      {/* Primary Action */}
      <button
        onClick={onNewWorkout}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        NUEVO ENTRENAMIENTO
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Peso Actual</span>
          <div className="text-2xl font-bold text-slate-800">{lastWeight?.weight_kg || '--'} <span className="text-sm font-medium text-slate-400">kg</span></div>
          <div className="text-[10px] text-indigo-500 mt-1">{lastWeight ? new Date(lastWeight.date).toLocaleDateString() : 'Sin registros'}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Entrenos</span>
          <div className="text-2xl font-bold text-slate-800">{workouts.length}</div>
          <div className="text-[10px] text-indigo-500 mt-1">Este mes: {workouts.filter(w => new Date(w.date).getMonth() === new Date().getMonth()).length}</div>
        </div>
      </div>

      {/* Progress Charts */}
      {
        weightLogs.length > 1 && (
          <ProgressChart
            type="weight"
            data={weightLogs}
            title="Evolución Peso Corporal"
          />
        )
      }

      {/* Top 1RM Progress */}
      <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          Mejores Marcas (1RM)
        </h2>
        <div className="space-y-3">
          {topPRs.length > 0 ? topPRs.map((pr, i) => (
            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
              <span className="text-sm font-medium text-slate-700">{pr.name}</span>
              <span className="text-sm font-bold text-indigo-600">{Math.round(pr.weight)} kg</span>
            </div>
          )) : (
            <p className="text-xs text-slate-400 italic">Registra entrenos para ver tus PRs</p>
          )}
        </div>
      </section>

      {/* Last Session Preview */}
      {
        lastWorkout && (
          <section>
            <h2 className="text-sm font-bold text-slate-800 mb-3 uppercase">Última Sesión</h2>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-600">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{new Date(lastWorkout.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {lastWorkout.workout_exercises?.map((we, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                    {we.exercise?.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )
      }
    </div >
  );
};

export default Home;
