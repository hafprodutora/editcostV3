
import React from 'react';
import { Project, ProjectStatus } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Eye, FileText, Trash2 } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Projeto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor/Hora</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tempo Gasto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Custo</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  Nenhum projeto encontrado. Comece criando um novo projeto!
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">#{project.number}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    <button 
                      onClick={() => onView(project)}
                      className="text-left hover:text-indigo-600 transition-colors"
                    >
                      {project.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{project.client}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {formatCurrency(project.hourlyRate, currency)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{formatTime(project.timeSpentSeconds)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(project.totalCost, currency)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onView(project)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver Projeto"
                      >
                        <Eye size={18} />
                      </button>
                      {project.status === 'Concluído' && (
                        <button
                          onClick={() => onReport(project)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Relatório Final"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(project.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {projects.length > 0 && (
            <tfoot className="bg-gray-900 text-white">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm font-bold text-right uppercase tracking-widest text-indigo-300">Resumo Global</td>
                <td className="px-6 py-4 text-sm font-black font-mono">{formatTime(totalTime)}</td>
                <td className="px-6 py-4 text-sm font-black text-emerald-400">{formatCurrency(totalCost, currency)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
