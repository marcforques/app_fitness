
import React from 'react';
import { Workout, Exercise, BodyWeightLog, ExerciseType, FoodLog } from '../types';
import { calculate1RM } from '../utils';
import ProgressChart from './ProgressChart';
import MindRepLogo from './MindRepLogo';

interface HomeProps {
  workouts: Workout[];
  exercises: Exercise[];
  weightLogs: BodyWeightLog[];
  foodLogs: FoodLog[];
  onNewWorkout: () => void;
  onViewExercise: (id: string) => void;
  onOpenSettings: () => void;
}

const Home: React.FC<HomeProps> = ({ workouts, exercises, weightLogs, foodLogs, onNewWorkout, onOpenSettings }) => {
  const lastWorkout = workouts[0];
  const lastWeight = weightLogs[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCalories = (foodLogs || [])
    .filter(log => log.date === todayStr)
    .reduce((acc, log) => acc + log.calories, 0);

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
    <div className="space-y-8">
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <MindRepLogo className="w-8 h-8" />
          <h1 className="text-xl font-extrabold tracking-tight text-black">MINDREP</h1>
        </div>
        <div
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900 font-bold cursor-pointer hover:bg-slate-50 transition-colors"
        >
          MP
        </div>
      </header>

      {/* Primary Action */}
      <button
        onClick={onNewWorkout}
        className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-blue-800 shadow-xl shadow-blue-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        INICIAR ENTRENAMIENTO
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Peso Actual</span>
          <div className="text-3xl font-bold text-black mt-1">{lastWeight?.weight_kg || '--'}<span className="text-sm font-medium text-slate-400 ml-1">kg</span></div>
          <div className="text-[10px] text-blue-700 mt-2 font-medium">{lastWeight ? new Date(lastWeight.date).toLocaleDateString() : 'Sin registros'}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Total Entrenos</span>
          <div className="text-3xl font-bold text-black mt-1">{workouts.length}</div>
          <div className="text-[10px] text-blue-700 mt-2 font-medium">Este mes: {workouts.filter(w => new Date(w.date).getMonth() === new Date().getMonth()).length}</div>
        </div>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="bg-black rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MindRepLogo className="w-24 h-24" variant="dark" />
        </div>
        <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4 relative z-10">Nutrición Hoy</h3>
        <div className="flex justify-between items-end relative z-10">
          <div>
            <div className="text-4xl font-bold tracking-tighter">{todayCalories}</div>
            <div className="text-xs font-medium text-slate-400 mt-1">kcal consumidas</div>
          </div>
          <div className="h-1 w-12 bg-blue-700 mb-2"></div>
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
      <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-800 mb-6 uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
          Mejores Marcas (1RM)
        </h2>
        <div className="space-y-4">
          {topPRs.length > 0 ? topPRs.map((pr, i) => (
            <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
              <span className="text-sm font-semibold text-slate-900">{pr.name}</span>
              <span className="text-lg font-bold text-red-600">{Math.round(pr.weight)} <span className="text-xs text-slate-400 font-medium">kg</span></span>
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
            <h2 className="text-[10px] font-bold tracking-widest text-slate-400 mb-4 uppercase">Última Sesión</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-black">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-900 capitalize text-lg">{new Date(lastWorkout.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {lastWorkout.workout_exercises?.map((we, i) => (
                  <span key={i} className="text-[10px] border border-slate-200 px-3 py-1 rounded-full text-slate-600 font-medium tracking-wide">
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
