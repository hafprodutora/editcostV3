import React, { useState, useMemo } from 'react';
import { Project, UserSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Plus, ArrowLeft, DollarSign, Briefcase } from 'lucide-react';

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
    fixedPrice: 0 as number | '',
    notes: '',
    startDate: today,
  });

  const quickOptions = [1, 3, 7, 12, 24];

  const estimatedCost = useMemo(() => {
    if (formData.estimatedHours === '' || formData.estimatedHours === 0) return 0;
    return (formData.estimatedHours as number) * settings.hourlyRate;
  }, [formData.estimatedHours, settings.hourlyRate]);

  const estimatedProfit = useMemo(() => {
    if (formData.fixedPrice === '' || formData.fixedPrice === 0) return 0;
    return (formData.fixedPrice as number) - estimatedCost;
  }, [formData.fixedPrice, estimatedCost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      estimatedHours: formData.estimatedHours === '' ? 0 : formData.estimatedHours,
      fixedPrice: formData.fixedPrice === '' ? 0 : formData.fixedPrice,
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
              <div className="relative">
                 <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
                 <input
                  type="text"
                  placeholder="Ex: Edição Canal YouTube"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Projeto (Preço Fechado)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">R$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.fixedPrice}
                  onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimativa de Horas</label>
            <div className="flex flex-col gap-3">
              <input
                type="number"
                placeholder="Ex: 10"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <div className="flex gap-2 flex-wrap">
                {quickOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFormData({ ...formData, estimatedHours: opt })}
                    className="px-3 py-1 text-xs font-medium border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {opt}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resumo de Custos e Lucro */}
          {(formData.estimatedHours !== '' && formData.estimatedHours > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Custo Estimado (Seu tempo)</p>
                <p className="text-sm font-bold text-gray-700">
                  {formatCurrency(estimatedCost, settings.currency)}
                </p>
              </div>
              <div className={`p-4 border rounded-xl ${estimatedProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-[10px] uppercase font-black mb-1 ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Lucro Estimado</p>
                <p className={`text-sm font-bold ${estimatedProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatCurrency(estimatedProfit, settings.currency)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
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
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
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