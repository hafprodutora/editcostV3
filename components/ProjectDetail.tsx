import React, { useState } from 'react';
import { Project, UserSettings } from '../types';
import { formatMinutesToDisplay, formatTime, formatCurrency } from '../utils/formatters';
import { Play, Pause, CheckSquare, ArrowLeft, RefreshCw, DollarSign, Calendar } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  settings: UserSettings;
  onUpdate: (updatedProject: Project) => void;
  onBack: () => void;
  onConclude: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, settings, onUpdate, onBack, onConclude }) => {
  // Use sessionDuration strictly for the UI button selection logic
  const [sessionDuration, setSessionDuration] = useState(settings.pomodoroDuration);
  
  // Deriving values from project prop which is updated by the global timer in App.tsx
  const timeLeft = project.pomodoroTimeLeft ?? (settings.pomodoroDuration * 60);
  const isActive = project.isTimerRunning === true;

  const handleStart = () => {
    // New rule: once Em edição, it never returns to Pausado.
    onUpdate({ ...project, status: 'Em edição', isTimerRunning: true });
  };

  const handlePause = () => {
    // New rule: status remains Em edição when pausing.
    onUpdate({ ...project, isTimerRunning: false });
  };

  const handleStop = () => {
    // This acts as the explicit RESET action.
    const resetTime = sessionDuration * 60;
    onUpdate({ 
      ...project, 
      isTimerRunning: false, 
      pomodoroTimeLeft: resetTime 
    });
  };

  const changeDuration = (mins: number) => {
    setSessionDuration(mins);
    const newTime = mins * 60;
    // Update global state immediately
    onUpdate({ ...project, pomodoroTimeLeft: newTime });
  };

  const calculateDaysSinceStart = () => {
    const start = new Date(project.startDate);
    const today = new Date();
    
    // Normalize to midnight for accurate day counting
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Projeto iniciado hoje';
    if (diffDays === 1) return 'Projeto iniciado há 1 dia';
    return `Projeto iniciado há ${diffDays} dias`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center">
            <span className={`px-4 py-1 rounded-full text-sm font-bold mb-8 ${
                project.status === 'Em edição' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {project.status.toUpperCase()}
              {isActive && <span className="ml-2 animate-pulse">●</span>}
            </span>

            <div className="timer-display text-8xl md:text-9xl font-black text-gray-900 mb-12 select-none tracking-tight">
              {formatMinutesToDisplay(timeLeft)}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[25, 60, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => changeDuration(mins)}
                  disabled={isActive}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    sessionDuration === mins
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6">
              {!isActive ? (
                <button
                  onClick={handleStart}
                  className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={28} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="w-16 h-16 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Pause size={28} fill="currentColor" />
                </button>
              )}
              
              <button
                onClick={handleStop}
                className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-gray-50 transition-all"
                title="Resetar Timer"
              >
                <RefreshCw size={20} />
              </button>

              {project.status !== 'Concluído' && (
                <button
                  onClick={() => onConclude(project)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <CheckSquare size={20} />
                  Concluir Projeto
                </button>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
            <div className="flex flex-col items-center md:items-start">
               <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Tempo Trabalhado</span>
               <span className="text-2xl font-bold">{formatTime(project.timeSpentSeconds)}</span>
            </div>
            <div className="h-px md:h-8 w-12 md:w-px bg-indigo-700"></div>
            <div className="flex flex-col items-center md:items-end">
               <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Custo em Tempo Real</span>
               <span className="text-2xl font-bold">{formatCurrency(project.totalCost, settings.currency)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm font-medium">
              Este projeto já custou {formatCurrency(project.totalCost, settings.currency)}
            </p>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Informações</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                <Calendar size={16} />
                <span className="text-sm font-bold">{calculateDaysSinceStart()}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Projeto</p>
                <p className="font-bold text-lg text-gray-800">{project.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Cliente</p>
                <p className="font-medium text-gray-800">{project.client}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-400 uppercase font-bold flex items-center gap-1">
                  <DollarSign size={12} />
                  Valor da Hora (Lock)
                </p>
                <p className="font-bold text-indigo-700">{formatCurrency(project.hourlyRate, settings.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Estimativa</p>
                <p className="font-medium text-gray-800">{project.estimatedHours ? `${project.estimatedHours} horas` : 'Não definida'}</p>
              </div>
              {project.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Observações</p>
                  <p className="text-sm text-gray-600 leading-relaxed italic">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
             <div className="flex items-center gap-2 text-orange-800 font-bold mb-2">
               <Pause size={18} />
               <span>Regras de Pausa</span>
             </div>
             <p className="text-sm text-orange-700">
               A cada ciclo de {sessionDuration} minutos, tire uma pausa de {settings.breakTime} minutos para manter o foco e a saúde mental.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;