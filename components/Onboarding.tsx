
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { POMODORO_OPTIONS, BREAK_OPTIONS } from '../constants';
import { Save } from 'lucide-react';

interface OnboardingProps {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const isSettings = settings.initialized;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, initialized: true });
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isSettings ? 'Configurações' : 'Bem-vindo ao EditCost'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isSettings 
            ? 'Ajuste seus valores globais. Mudanças de preço afetarão apenas novos projetos.' 
            : 'Configure seu perfil para começar a faturar.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custo por hora (R$)</label>
          <input
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duração padrão do Pomodoro</label>
          <div className="grid grid-cols-3 gap-3">
            {POMODORO_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData({ ...formData, pomodoroDuration: opt })}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  formData.pomodoroDuration === opt
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de pausa</label>
          <div className="grid grid-cols-2 gap-3">
            {BREAK_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData({ ...formData, breakTime: opt })}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  formData.breakTime === opt
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="BRL">BRL (R$)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Save size={20} />
          {isSettings ? 'Salvar Configurações' : 'Salvar e ir para o Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
