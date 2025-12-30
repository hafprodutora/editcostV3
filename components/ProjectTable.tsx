import React from 'react';
import { Project, ProjectStatus } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Eye, FileText, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
  currency: string;
  onView: (project: Project) => void;
  onReport: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, currency, onView, onReport, onDelete }) => {
  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'Em edição':
        return 'bg-orange-100 text-orange-700';
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const totalTime = projects.reduce((acc, p) => acc + p.timeSpentSeconds, 0);
  const totalCost = projects.reduce((acc, p) => acc + p.totalCost, 0);
  const totalFixed = projects.reduce((acc, p) => acc + p.fixedPrice, 0);
  const totalProfit = totalFixed - totalCost;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projeto</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Fechado</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tempo</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo (Tempo)</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lucro Atual</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                  Nenhum projeto em andamento.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const profit = project.fixedPrice - project.totalCost;
                return (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-300">#{project.number}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <button 
                        onClick={() => onView(project)}
                        className="text-left group-hover:text-indigo-600 transition-colors"
                      >
                        {project.name}
                        <p className="text-[10px] font-medium text-gray-400 uppercase">{project.client}</p>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                      {formatCurrency(project.fixedPrice, currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {formatTime(project.timeSpentSeconds)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(project.totalCost, currency)}
                    </td>
                    <td className={`px-6 py-4 text-sm font-black flex items-center gap-1 mt-3.5 ${profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                      {profit >= 0 ? <TrendingUp size={14} className="opacity-50" /> : <TrendingDown size={14} className="opacity-50" />}
                      {formatCurrency(profit, currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onView(project)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        {project.status === 'Concluído' && (
                          <button
                            onClick={() => onReport(project)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(project.id)}
                          className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {projects.length > 0 && (
            <tfoot className="bg-indigo-900 text-white">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Totais Gerais</td>
                <td className="px-6 py-4 text-sm font-black text-emerald-400">{formatCurrency(totalFixed, currency)}</td>
                <td className="px-6 py-4 text-sm font-black font-mono">{formatTime(totalTime)}</td>
                <td className="px-6 py-4 text-sm font-medium text-indigo-300 opacity-70">{formatCurrency(totalCost, currency)}</td>
                <td className="px-6 py-4 text-lg font-black text-white">{formatCurrency(totalProfit, currency)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;