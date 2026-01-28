import React, { useState } from 'react';
import { FoodLog, MealType } from '../types';
import { dbService } from '../db';
import { generateUUID } from '../utils';

interface MealTrackerProps {
    logs: FoodLog[];
    onAdd: (log: Omit<FoodLog, 'id' | 'created_at'>) => void;
    onDelete: (id: string) => void;
}

const MealTracker: React.FC<MealTrackerProps> = ({ logs, onAdd, onDelete }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAdding, setIsAdding] = useState(false);
    const [addingMealType, setAddingMealType] = useState<MealType>('desayuno');

    // Form State
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    const mealTypes: { id: MealType; label: string; icon: string }[] = [
        { id: 'desayuno', label: 'Desayuno', icon: '☕' },
        { id: 'almuerzo', label: 'Almuerzo', icon: '🥪' },
        { id: 'comida', label: 'Comida', icon: '🍽️' },
        { id: 'merienda', label: 'Merienda', icon: '🍎' },
        { id: 'cena', label: 'Cena', icon: '🌙' },
    ];

    const filteredLogs = logs.filter(log => log.date === selectedDate);

    const getTotals = (logsToSum: FoodLog[]) => {
        return logsToSum.reduce((acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein_g,
            carbs: acc.carbs + log.carbs_g,
            fats: acc.fats + log.fats_g
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    const dayTotals = getTotals(filteredLogs);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !calories) return;

        onAdd({
            date: selectedDate,
            name,
            calories: Number(calories),
            protein_g: Number(protein) || 0,
            carbs_g: Number(carbs) || 0,
            fats_g: Number(fats) || 0,
            type: addingMealType
        });

        setIsAdding(false);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFats('');
    };

    const openAddModal = (type: MealType) => {
        setAddingMealType(type);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-center py-4">
                <h1 className="text-xl font-bold text-black uppercase tracking-tight">Nutrición</h1>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </header>

            {/* Daily Summary Card */}
            <div className="bg-black rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Calorías Totales</span>
                        <div className="text-4xl font-bold tracking-tighter mt-1">{dayTotals.calories}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-semibold text-blue-500 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-900/50">
                            {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 relative z-10">
                    <div className="text-center">
                        <div className="text-slate-500 text-[10px] uppercase mb-1 font-bold">Proteínas</div>
                        <div className="font-bold text-lg">{dayTotals.protein}<span className="text-xs text-slate-500 ml-0.5">g</span></div>
                    </div>
                    <div className="text-center border-l border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-1 font-bold">Carbos</div>
                        <div className="font-bold text-lg">{dayTotals.carbs}<span className="text-xs text-slate-500 ml-0.5">g</span></div>
                    </div>
                    <div className="text-center border-l border-slate-800">
                        <div className="text-slate-500 text-[10px] uppercase mb-1 font-bold">Grasas</div>
                        <div className="font-bold text-lg">{dayTotals.fats}<span className="text-xs text-slate-500 ml-0.5">g</span></div>
                    </div>
                </div>
            </div>

            {/* Meal Sections */}
            <div className="space-y-4">
                {mealTypes.map((mealType) => {
                    const mealLogs = filteredLogs.filter(log => log.type === mealType.id);
                    const mealTotals = getTotals(mealLogs);

                    return (
                        <div key={mealType.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl opacity-80">{mealType.icon}</span>
                                    <h3 className="font-bold text-slate-900 capitalize text-sm tracking-wide">{mealType.label}</h3>
                                </div>
                                <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                    {mealTotals.calories} kcal
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                {mealLogs.length > 0 ? (
                                    mealLogs.map(log => (
                                        <div key={log.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg group transition-colors border border-transparent hover:border-slate-100">
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm">{log.name}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                                                    P: {log.protein_g} • C: {log.carbs_g} • F: {log.fats_g}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-700 text-sm">{log.calories}</span>
                                                <button
                                                    onClick={() => onDelete(log.id)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-xs text-slate-400 italic">No hay registros</div>
                                )}

                                <button
                                    onClick={() => openAddModal(mealType.id)}
                                    className="w-full mt-2 py-3 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-200 flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Añadir Alimento
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Food Modal Overlay */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col h-full">
                            <div className="bg-black px-6 py-4 flex justify-between items-center text-white border-b border-slate-800 shrink-0">
                                <h3 className="font-bold text-lg tracking-tight">Añadir a {addingMealType.charAt(0).toUpperCase() + addingMealType.slice(1)}</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Nombre Alimento</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej. Pechuga de Pollo 100g"
                                        className="w-full px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">
                                            Calorías <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={calories}
                                                onChange={(e) => setCalories(e.target.value)}
                                                className="w-full px-3 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-bold text-slate-900"
                                            />
                                            <span className="absolute right-3 top-3.5 text-slate-400 text-sm font-medium">kcal</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Proteínas</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={protein}
                                                onChange={(e) => setProtein(e.target.value)}
                                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                            />
                                            <span className="absolute right-2 top-2 text-slate-400 text-xs">g</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Carbos</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={carbs}
                                                onChange={(e) => setCarbs(e.target.value)}
                                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                            />
                                            <span className="absolute right-2 top-2 text-slate-400 text-xs">g</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Grasas</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={fats}
                                                onChange={(e) => setFats(e.target.value)}
                                                className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                                            />
                                            <span className="absolute right-2 top-2 text-slate-400 text-xs">g</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200 mb-safe"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealTracker;
