import React, { useState, useMemo } from 'react';
import { Project, UserSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Plus, ArrowLeft } from 'lucide-react';

interface CreateProjectProps {
  settings: UserSettings;
  onSave: (project: Omit<Project, 'id' | 'number' | 'status' | 'timeSpentSeconds' | 'totalCost' | 'createdAt'>) => void;
  onBack: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ settings, onSave, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    estimatedHours: 0 as number | '',
    notes: '',
    startDate: today,
  });

  const quickOptions = [1, 3, 7];

  const estimatedCost = useMemo(() => {
    if (formData.estimatedHours === '' || formData.estimatedHours === 0) return 0;
    return (formData.estimatedHours as number) * settings.hourlyRate;
  }, [formData.estimatedHours, settings.hourlyRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      estimatedHours: formData.estimatedHours === '' ? 0 : formData.estimatedHours,
      startDate: new Date(formData.startDate).getTime()
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Projeto</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
              <input
                type="text"
                placeholder="Ex: Edição Casamento Maria & João"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de início</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimativa de Horas (Opcional)</label>
              <div className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="Ex: 10"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <div className="flex gap-2 flex-wrap">
                  {quickOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, estimatedHours: opt })}
                      className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      {opt} {opt === 1 ? 'hora' : 'horas'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {formData.estimatedHours !== '' && formData.estimatedHours > 0 && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <p className="text-sm font-semibold text-indigo-600">
                Custo estimado deste projeto: {formatCurrency(estimatedCost, settings.currency)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Notas adicionais sobre o projeto..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Criar Projeto
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;