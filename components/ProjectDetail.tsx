import React, { useState } from 'react';
import { Project, UserSettings, Deliverable } from '../types';
import { formatMinutesToDisplay, formatTime, formatCurrency } from '../utils/formatters';
import { Play, Pause, CheckSquare, ArrowLeft, RefreshCw, DollarSign, Calendar, TrendingUp, Package, Video, ListTodo, Circle, CheckCircle2 } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  settings: UserSettings;
  onUpdate: (updatedProject: Project) => void;
  onBack: () => void;
  onConclude: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, settings, onUpdate, onBack, onConclude }) => {
  const [sessionDuration, setSessionDuration] = useState(settings.pomodoroDuration);
  
  const timeLeft = project.pomodoroTimeLeft ?? (settings.pomodoroDuration * 60);
  const isActive = project.isTimerRunning === true;

  const currentProfit = project.fixedPrice - project.totalCost;
  const isComplex = project.type === 'complex';

  const handleStart = () => {
    if (isComplex && !project.activeDeliverableId) {
      alert("Por favor, selecione uma subtask antes de iniciar o timer.");
      return;
    }
    onUpdate({ ...project, status: 'Em edição', isTimerRunning: true });
  };

  const handlePause = () => {
    onUpdate({ ...project, isTimerRunning: false });
  };

  const handleStop = () => {
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
    onUpdate({ ...project, pomodoroTimeLeft: newTime });
  };

  const toggleDeliverableStatus = (id: string) => {
    if (!project.deliverables) return;
    const updated = project.deliverables.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'Concluído' ? 'Pendente' : 'Concluído';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    onUpdate({ ...project, deliverables: updated });
  };

  const selectActiveDeliverable = (id: string) => {
    if (isActive) return; // Prevent change while running
    onUpdate({ ...project, activeDeliverableId: id });
  };

  const activeDel = project.deliverables?.find(d => d.id === project.activeDeliverableId);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={18} />
        Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col items-center text-center">
            <span className={`px-4 py-1 rounded-full text-sm font-bold mb-4 ${project.status === 'Em edição' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
              {project.status.toUpperCase()}
              {isActive && <span className="ml-2 animate-pulse">●</span>}
            </span>

            {isComplex && (
              <div className="mb-6 flex flex-col items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trabalhando em:</p>
                {activeDel ? (
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-xl font-bold border border-indigo-100">
                    <Package size={14} />
                    <span>{activeDel.name}</span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-red-400 italic">Selecione uma subtask abaixo</p>
                )}
              </div>
            )}

            <div className="timer-display text-8xl md:text-9xl font-black text-gray-900 mb-12 select-none tracking-tight">
              {formatMinutesToDisplay(timeLeft)}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[25, 60, 120].map(mins => (
                <button key={mins} onClick={() => changeDuration(mins)} disabled={isActive} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${sessionDuration === mins ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50'}`}>
                  {mins} min
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6">
              {!isActive ? (
                <button onClick={handleStart} className="w-16 h-16 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-xl transition-all hover:scale-105 active:scale-95">
                  <Play size={28} fill="currentColor" />
                </button>
              ) : (
                <button onClick={handlePause} className="w-16 h-16 flex items-center justify-center bg-orange-500 text-white rounded-full hover:bg-orange-600 shadow-xl transition-all hover:scale-105 active:scale-95">
                  <Pause size={28} fill="currentColor" />
                </button>
              )}
              <button onClick={handleStop} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-gray-50 transition-all">
                <RefreshCw size={20} />
              </button>
              {project.status !== 'Concluído' && (
                <button onClick={() => onConclude(project)} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:scale-105 active:scale-95">
                  <CheckSquare size={20} />
                  Concluir Projeto
                </button>
              )}
            </div>
          </div>

          {/* Subtasks Tracking for Complex Projects */}
          {isComplex && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ListTodo size={14} className="text-indigo-500" />
                  Subtasks & Entregáveis
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase italic">Clique para selecionar para o timer</p>
              </div>
              <div className="space-y-2">
                {project.deliverables?.map(d => {
                  const isSelected = project.activeDeliverableId === d.id;
                  const isDone = d.status === 'Concluído';
                  return (
                    <div 
                      key={d.id} 
                      onClick={() => !isDone && selectActiveDeliverable(d.id)}
                      className={`group p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-200' : 
                        isDone ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-100 bg-white hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleDeliverableStatus(d.id); }}
                          className={`transition-colors ${isDone ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'}`}
                        >
                          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <div>
                          <p className={`text-sm font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{d.name}</p>
                          <p className="text-[10px] font-medium text-gray-400">Progresso: {formatTime(d.trackedSeconds)} / {d.estimatedHours}h</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">{formatCurrency((d.trackedSeconds / 3600) * project.hourlyRate, settings.currency)}</p>
                        {isSelected && <span className="text-[8px] font-black text-indigo-500 uppercase">Selecionada</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Informações do Projeto</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Projeto</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg text-gray-800">{project.name}</p>
                  {isComplex && <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded uppercase">Complexo</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Cliente</p>
                <p className="font-medium text-gray-800">{project.client}</p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-400 uppercase font-bold">Custo da Hora</p>
                <p className="font-bold text-indigo-700">{formatCurrency(project.hourlyRate, settings.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Total Acordado</p>
                <p className="font-bold text-emerald-600">{formatCurrency(project.fixedPrice, settings.currency)}</p>
              </div>
              {project.extraCosts && project.extraCosts.length > 0 && (
                <div>
                   <p className="text-xs text-gray-400 uppercase font-bold">Custos Extras</p>
                   <div className="mt-1 space-y-1">
                     {project.extraCosts.map(e => (
                       <div key={e.id} className="flex justify-between text-xs">
                         <span className="text-gray-500">{e.name}</span>
                         <span className="font-bold text-orange-600">{formatCurrency(e.value, settings.currency)}</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;