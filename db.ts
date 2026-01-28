
import { Exercise, Workout, BodyWeightLog, ExerciseType, Set, RunningLog, WorkoutExercise, Routine, FoodLog } from './types';
import { generateUUID } from './utils';

const STORAGE_KEY = 'miprogreso_db';

interface DBState {
  exercises: Exercise[];
  workouts: Workout[];
  workout_exercises: WorkoutExercise[];
  sets: Set[];
  running_logs: RunningLog[];
  body_weight_logs: BodyWeightLog[];
  routines: Routine[];
  food_logs: FoodLog[];
}

const initialState: DBState = {
  exercises: [
    { id: '1', name: 'Press de Banca', type: ExerciseType.GYM, created_at: new Date().toISOString() },
    { id: '2', name: 'Sentadilla', type: ExerciseType.GYM, created_at: new Date().toISOString() },
    { id: '3', name: 'Running Exterior', type: ExerciseType.RUNNING, created_at: new Date().toISOString() }
  ],
  workouts: [],
  workout_exercises: [],
  sets: [],
  running_logs: [],
  body_weight_logs: [],
  routines: [
    { id: 'r1', name: 'Rutina de Fuerza A', exercise_ids: ['1', '2'], created_at: new Date().toISOString() }
  ],
  food_logs: []
};

export const getDB = (): DBState => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialState;
};

export const saveDB = (state: DBState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const dbService = {
  getExercises: () => getDB().exercises,

  addExercise: (name: string, type: ExerciseType) => {
    const db = getDB();
    const newExercise: Exercise = {
      id: generateUUID(),
      name,
      type,
      created_at: new Date().toISOString()
    };
    db.exercises.push(newExercise);
    saveDB(db);
    return newExercise;
  },

  deleteExercise: (id: string) => {
    const db = getDB();
    db.exercises = db.exercises.filter(e => e.id !== id);
    saveDB(db);
  },

  getRoutines: () => getDB().routines,

  saveRoutine: (name: string, exerciseIds: string[]) => {
    const db = getDB();
    const newRoutine: Routine = {
      id: generateUUID(),
      name,
      exercise_ids: exerciseIds,
      created_at: new Date().toISOString()
    };
    db.routines.push(newRoutine);
    saveDB(db);
    return newRoutine;
  },

  deleteRoutine: (id: string) => {
    const db = getDB();
    db.routines = db.routines.filter(r => r.id !== id);
    saveDB(db);
  },

  getLastPerformance: (exerciseId: string) => {
    const db = getDB();
    const lastWE = db.workout_exercises
      .filter(we => we.exercise_id === exerciseId)
      .sort((a, b) => {
        const dateA = db.workouts.find(w => w.id === a.workout_id)?.date || '';
        const dateB = db.workouts.find(w => w.id === b.workout_id)?.date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })[0];

    if (!lastWE) return null;

    return {
      sets: db.sets.filter(s => s.workout_exercise_id === lastWE.id),
      running_log: db.running_logs.find(rl => rl.workout_exercise_id === lastWE.id)
    };
  },

  getWorkouts: () => {
    const db = getDB();
    return db.workouts.map(w => ({
      ...w,
      workout_exercises: db.workout_exercises
        .filter(we => we.workout_id === w.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map(we => ({
          ...we,
          exercise: db.exercises.find(e => e.id === we.exercise_id),
          sets: db.sets.filter(s => s.workout_exercise_id === we.id),
          running_log: db.running_logs.find(rl => rl.workout_exercise_id === we.id)
        }))
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveWorkout: (workout: Partial<Workout>, workoutExercises: any[]) => {
    const db = getDB();
    const workoutId = workout.id || generateUUID();

    const existingIndex = db.workouts.findIndex(w => w.id === workoutId);
    const newWorkout: Workout = {
      id: workoutId,
      routine_id: workout.routine_id, // Persistimos la relación con la rutina
      date: workout.date || new Date().toISOString().split('T')[0],
      notes: workout.notes || '',
      created_at: workout.created_at || new Date().toISOString()
    };

    if (existingIndex > -1) db.workouts[existingIndex] = newWorkout;
    else db.workouts.push(newWorkout);

    const oldWEIds = db.workout_exercises.filter(we => we.workout_id === workoutId).map(we => we.id);
    db.workout_exercises = db.workout_exercises.filter(we => we.workout_id !== workoutId);
    db.sets = db.sets.filter(s => !oldWEIds.includes(s.workout_exercise_id));
    db.running_logs = db.running_logs.filter(rl => !oldWEIds.includes(rl.workout_exercise_id));

    workoutExercises.forEach((weData, idx) => {
      const weId = generateUUID();
      db.workout_exercises.push({
        id: weId,
        workout_id: workoutId,
        exercise_id: weData.exercise_id,
        order_index: idx
      });

      if (weData.sets) {
        weData.sets.forEach((setData: any, sIdx: number) => {
          db.sets.push({
            id: generateUUID(),
            workout_exercise_id: weId,
            set_index: sIdx,
            reps: Number(setData.reps),
            weight_kg: Number(setData.weight_kg)
          });
        });
      }

      if (weData.running_log) {
        db.running_logs.push({
          id: generateUUID(),
          workout_exercise_id: weId,
          distance_km: Number(weData.running_log.distance_km),
          time_minutes: Number(weData.running_log.time_minutes),
          avg_heart_rate: weData.running_log.avg_heart_rate ? Number(weData.running_log.avg_heart_rate) : undefined
        });
      }
    });

    saveDB(db);
    return newWorkout;
  },

  deleteWorkout: (id: string) => {
    const db = getDB();
    const weIds = db.workout_exercises.filter(we => we.workout_id === id).map(we => we.id);
    db.workouts = db.workouts.filter(w => w.id !== id);
    db.workout_exercises = db.workout_exercises.filter(we => we.workout_id !== id);
    db.sets = db.sets.filter(s => !weIds.includes(s.workout_exercise_id));
    db.running_logs = db.running_logs.filter(rl => !weIds.includes(rl.workout_exercise_id));
    saveDB(db);
  },

  getBodyWeightLogs: () => {
    return getDB().body_weight_logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addBodyWeightLog: (weight: number, date: string, notes?: string) => {
    const db = getDB();
    const newLog: BodyWeightLog = {
      id: generateUUID(),
      date,
      weight_kg: weight,
      notes,
      created_at: new Date().toISOString()
    };
    db.body_weight_logs.push(newLog);
    saveDB(db);
    return newLog;
  },

  deleteBodyWeightLog: (id: string) => {
    const db = getDB();
    db.body_weight_logs = db.body_weight_logs.filter(l => l.id !== id);
    saveDB(db);
  },

  getAllFoodLogs: () => {
    return getDB().food_logs || [];
  },

  getFoodLogsByDate: (date: string) => {
    return (getDB().food_logs || []).filter(log => log.date === date);
  },

  addFoodLog: (log: Omit<FoodLog, 'id' | 'created_at'>) => {
    const db = getDB();
    // Ensure food_logs exists (migration for old data)
    if (!db.food_logs) db.food_logs = [];

    const newLog: FoodLog = {
      ...log,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };
    db.food_logs.push(newLog);
    saveDB(db);
    return newLog;
  },

  deleteFoodLog: (id: string) => {
    const db = getDB();
    if (!db.food_logs) return;
    db.food_logs = db.food_logs.filter(f => f.id !== id);
    saveDB(db);
  },

  exportData: () => {
    return JSON.stringify(getDB());
  },

  importData: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      // Basic validation
      if (data.exercises && data.workouts && data.routines) {
        saveDB(data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetData: () => {
    saveDB(initialState);
  }
};
