
export enum ExerciseType {
  GYM = 'gym',
  RUNNING = 'running'
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  created_at: string;
}

export interface Set {
  id: string;
  workout_exercise_id: string;
  set_index: number;
  reps: number;
  weight_kg: number;
}

export interface RunningLog {
  id: string;
  workout_exercise_id: string;
  distance_km: number;
  time_minutes: number;
  avg_heart_rate?: number;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  exercise?: Exercise;
  sets?: Set[];
  running_log?: RunningLog;
}

export interface Workout {
  id: string;
  routine_id?: string; // Nuevo: vincula el entreno a una rutina específica
  date: string;
  notes?: string;
  created_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface Routine {
  id: string;
  name: string;
  exercise_ids: string[];
  created_at: string;
}

export interface BodyWeightLog {
  id: string;
  date: string;
  weight_kg: number;
  notes?: string;
  created_at: string;
}

export type AppView = 'home' | 'history' | 'weight' | 'exercises' | 'new-workout' | 'routines' | 'settings';
