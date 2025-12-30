
import React, { useMemo } from 'react';
import { Project, UserSettings } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Download, ArrowLeft, CheckCircle2, TrendingUp, TrendingDown, Target, ListChecks, Clock } from 'lucide-react';

interface ReportProps {
  project: Project;
  settings: UserSettings;
  onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ project, settings, onBack }) => {
  const isComplex = project.type === 'complex';
  
  const subtasksTotalSeconds = useMemo(() => {
    if (!isComplex || !project.deliverables) return 0;
    return project.deliverables.reduce((acc, d) => acc + d.trackedSeconds, 0);
  }, [isComplex, project.deliverables]);

  const subtasksTotalCost = useMemo(() => {
    if (!isComplex || !project.deliverables) return 0;
    return project.deliverables.reduce((acc, d) => acc + (d.trackedSeconds / 3600 * project.hourlyRate), 0);
  }, [isComplex, project.deliverables, project.hourlyRate]);

  // For complex projects, total time is sum of subtasks, otherwise use project level tracking
  const finalTimeSeconds = isComplex ? subtasksTotalSeconds : project.timeSpentSeconds;
  
  const finalProfit = project.fixedPrice - project.totalCost;
  const isProfitable = finalProfit >= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="no-print mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden" id="report-content">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatório Final</h1>
            <p className="opacity-80">Projeto concluído em {new Date(project.completedAt || Date.now()).toLocaleDateString('pt-BR')}</p>
          </div>
          <CheckCircle2 size={48} className="text-indigo-200" />
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Resumo do Projeto</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{project.name}</p>
                    {isComplex && <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded uppercase">Complexo</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valor Fechado</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(project.fixedPrice, settings.currency)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center md:items-end">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Lucro Líquido</h3>
               <p className={`text-5xl font-black ${isProfitable ? 'text-indigo-600' : 'text-red-600'}`}>
                 {formatCurrency(finalProfit, settings.currency)}
               </p>
               <p className="text-gray-500 text-sm mt-2 font-bold">Custo Operacional: {formatCurrency(project.totalCost, settings.currency)}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={14} className="text-indigo-500" />
              Análise de Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Horas Reais Totais</p>
                <p className="text-xl font-bold text-gray-900">{formatTime(finalTimeSeconds)}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-black text-gray-400 mb-1">Custo por Hora (Snap)</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(project.hourlyRate, settings.currency)}</p>
              </div>
            </div>
          </div>

          {isComplex && project.deliverables && project.deliverables.length > 0 && (
            <div className="border-t border-gray-100 pt-10 animate-in fade-in duration-500">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <ListChecks size={14} className="text-indigo-500" />
                Detalhamento por Subtarefa
              </h3>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtarefa</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Custo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {project.deliverables.map(d => (
                      <tr key={d.id}>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{d.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{formatTime(d.trackedSeconds)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          {formatCurrency((d.trackedSeconds / 3600) * project.hourlyRate, settings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-indigo-50/50 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-xs font-black text-gray-400 uppercase">Totais Subtasks</td>
                      <td className="px-6 py-4 text-sm text-indigo-700">{formatTime(subtasksTotalSeconds)}</td>
                      <td className="px-6 py-4 text-sm text-indigo-700 text-right">{formatCurrency(subtasksTotalCost, settings.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <div className="no-print pt-10 flex gap-4">
             <button
               onClick={handlePrint}
               className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
             >
               <Download size={20} />
               Gerar PDF do Relatório
             </button>
             <button
               onClick={onBack}
               className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold hover:bg-gray-50 transition-all"
             >
               Voltar ao Dashboard
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
