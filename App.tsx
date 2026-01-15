
import React, { useState, useEffect } from 'react';
import { AppView, Exercise, Workout, BodyWeightLog, Routine } from './types';
import { dbService } from './db';
import Home from './components/Home';
import History from './components/History';
import WeightTracker from './components/WeightTracker';
import ExerciseList from './components/ExerciseList';
import RoutineList from './components/RoutineList';
import WorkoutForm from './components/WorkoutForm';
import Navigation from './components/Navigation';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weightLogs, setWeightLogs] = useState<BodyWeightLog[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const refreshData = () => {
    setExercises(dbService.getExercises());
    setWorkouts(dbService.getWorkouts());
    setWeightLogs(dbService.getBodyWeightLogs());
    setRoutines(dbService.getRoutines());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setCurrentView('new-workout');
  };

  const handleViewChange = (view: AppView) => {
    if (view !== 'new-workout') setEditingWorkout(null);
    setCurrentView(view);
  };

  const handleDataChanged = () => {
    refreshData();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-x-hidden">
      <main className="flex-1 w-full max-w-lg mx-auto p-4 animate-in fade-in duration-500">
        {currentView === 'home' && (
          <Home
            workouts={workouts}
            exercises={exercises}
            weightLogs={weightLogs}
            onNewWorkout={() => handleViewChange('new-workout')}
            onViewExercise={(exId) => handleViewChange('exercises')}
            onOpenSettings={() => handleViewChange('settings')}
          />
        )}

        {currentView === 'history' && (
          <History
            workouts={workouts}
            routines={routines}
            onEdit={handleEditWorkout}
            onDelete={(id) => {
              dbService.deleteWorkout(id);
              refreshData();
            }}
          />
        )}

        {currentView === 'weight' && (
          <WeightTracker
            logs={weightLogs}
            onAdd={(w, d, n) => {
              dbService.addBodyWeightLog(w, d, n);
              refreshData();
            }}
            onDelete={(id) => {
              dbService.deleteBodyWeightLog(id);
              refreshData();
            }}
          />
        )}

        {currentView === 'exercises' && (
          <ExerciseList
            exercises={exercises}
            workouts={workouts}
            onAdd={(n, t) => {
              dbService.addExercise(n, t);
              refreshData();
            }}
            onDelete={(id) => {
              dbService.deleteExercise(id);
              refreshData();
            }}
          />
        )}

        {currentView === 'routines' && (
          <RoutineList
            routines={routines}
            availableExercises={exercises}
            workouts={workouts}
            onAdd={(n, ids) => {
              dbService.saveRoutine(n, ids);
              refreshData();
            }}
            onDelete={(id) => {
              dbService.deleteRoutine(id);
              refreshData();
            }}
          />
        )}

        {currentView === 'new-workout' && (
          <WorkoutForm
            initialWorkout={editingWorkout}
            availableExercises={exercises}
            onCancel={() => handleViewChange('home')}
            onSave={(workoutData, weData) => {
              dbService.saveWorkout(workoutData, weData);
              refreshData();
              handleViewChange('history');
            }}
          />
        )}

        {currentView === 'settings' && (
          <Settings
            onBack={() => handleViewChange('home')}
            onDataChanged={handleDataChanged}
          />
        )}
      </main>

      {currentView !== 'new-workout' && (
        <Navigation currentView={currentView} setView={handleViewChange} />
      )}
    </div>
  );
};

export default App;
