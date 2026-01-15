
import React, { useState } from 'react';
import { dbService } from '../db';
import { AppView } from '../types';

interface SettingsProps {
    onBack: () => void;
    onDataChanged: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onDataChanged }) => {
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleExport = () => {
        const data = dbService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `miprogreso_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (dbService.importData(content)) {
                setImportStatus('success');
                onDataChanged();
                setTimeout(() => setImportStatus('idle'), 3000);
            } else {
                setImportStatus('error');
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro? Esto borrará TODOS tus datos y NO se puede deshacer.')) {
            dbService.resetData();
            onDataChanged();
            onBack();
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4 py-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-95 transition-transform"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
            </header>

            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50">
                    <h2 className="font-bold text-slate-800 mb-1">Datos</h2>
                    <p className="text-xs text-slate-500">Gestiona tus copias de seguridad</p>
                </div>

                <div className="divide-y divide-slate-50">
                    <button
                        onClick={handleExport}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Exportar Datos</span>
                        </div>
                    </button>

                    <label className="w-full p-4 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-700 block">Importar Datos</span>
                                {importStatus === 'success' && <span className="text-xs text-emerald-600">¡Importado correctamente!</span>}
                                {importStatus === 'error' && <span className="text-xs text-red-500">Error al importar archivo</span>}
                            </div>
                        </div>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>

                    <button
                        onClick={handleReset}
                        className="w-full p-4 flex items-center justify-between hover:bg-red-50 active:bg-red-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-red-600">Borrar Todo</span>
                        </div>
                    </button>
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 text-center">
                <p className="text-sm text-slate-500 mb-2">Para instalar en tu móvil:</p>
                <ol className="text-xs text-slate-400 text-left list-decimal pl-8 space-y-1">
                    <li>Abre esta web en Chrome/Safari</li>
                    <li>Toca en "Compartir" o Menú</li>
                    <li>Selecciona "Añadir a pantalla de inicio"</li>
                </ol>
            </section>
        </div>
    );
};

export default Settings;
