import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { POMODORO_OPTIONS, BREAK_OPTIONS } from '../constants';
import { Save, Calculator, Landmark, Clock, CalendarDays } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface OnboardingProps {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ settings, onSave }) => {
  // Define isSettings based on whether the app has already been initialized
  const isSettings = settings.initialized;
  
  const [formData, setFormData] = useState<UserSettings>({
    ...settings,
    daysPerWeek: settings.daysPerWeek || 5
  });
  const [desiredSalary, setDesiredSalary] = useState(5000);
  const [dailyAverage, setDailyAverage] = useState(4); // Média diária inicial: 4h

  const formatDecimalToTime = (decimal: number) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours}h${minutes.toString().padStart(2, '0')}min`;
  };

  const formatDailyAverageDisplay = (val: number) => {
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return m === 0 ? `${h}h` : `${h}h${m}`;
  };

  // Cálculos baseados na nova lógica:
  // Média Semanal = Média Diária × Dias por semana
  // Horas de trabalho (mês) = Média Semanal × 4.33
  const weeklyAverage = dailyAverage * formData.daysPerWeek;
  const monthlyHours = weeklyAverage * 4.33;

  // Recalculate hourly rate when salary or monthly hours change
  useEffect(() => {
    if (monthlyHours > 0) {
      const calculatedRate = desiredSalary / monthlyHours;
      setFormData(prev => ({ ...prev, hourlyRate: Number(calculatedRate.toFixed(2)) }));
    }
  }, [desiredSalary, monthlyHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, initialized: true });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isSettings ? 'Configurações' : 'Configurar Hora de Trabalho'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isSettings 
            ? 'Ajuste seus valores globais para novos projetos.' 
            : 'Vamos calcular o valor da sua hora com base nos seus objetivos.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Calculadora de Hora */}
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-6">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <Calculator size={20} />
            <span>Calculadora de Valor/Hora</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Landmark size={16} className="text-indigo-500" />
                  Salário desejado (mês)
                </label>
                <span className="text-indigo-600 font-bold tabular-nums">{formatCurrency(desiredSalary, formData.currency)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(Number(e.target.value))}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="number"
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(Number(e.target.value))}
                className="mt-2 w-full px-3 py-1.5 text-sm border border-indigo-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    Média Diária (horas/dia)
                  </label>
                  <span className="text-indigo-600 font-bold w-16 text-center tabular-nums inline-block">
                    {formatDailyAverageDisplay(dailyAverage)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  step="0.5"
                  value={dailyAverage}
                  onChange={(e) => setDailyAverage(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays size={16} className="text-indigo-500" />
                    Dias por semana
                  </label>
                  <span className="text-indigo-600 font-bold w-14 text-center tabular-nums inline-block">
                    {formData.daysPerWeek} dias
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={formData.daysPerWeek}
                  onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-indigo-100/50">
              <div className="text-center border-r border-indigo-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Média Semanal</p>
                <p className="text-sm font-bold text-indigo-700 tabular-nums">{weeklyAverage.toFixed(1)}h <span className="text-gray-400 font-normal">({formatDecimalToTime(weeklyAverage)})</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Horas de Trabalho (Mês)</p>
                <p className="text-sm font-bold text-indigo-700 tabular-nums">{monthlyHours.toFixed(1)}h <span className="text-gray-400 font-normal">({formatDecimalToTime(monthlyHours)})</span></p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-indigo-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600 uppercase">Valor calculado da sua hora:</span>
              <span className="text-2xl font-black text-indigo-700 tabular-nums">{formatCurrency(formData.hourlyRate, formData.currency)}</span>
            </div>
          </div>
        </div>

        {/* Outras Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duração do Pomodoro</label>
            <div className="flex gap-2">
              {POMODORO_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData({ ...formData, pomodoroDuration: opt })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.pomodoroDuration === opt
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de pausa</label>
            <div className="flex gap-2">
              {BREAK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFormData({ ...formData, breakTime: opt })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.breakTime === opt
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Moeda Preferencial</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="BRL">Real (R$)</option>
            <option value="USD">Dólar (US$)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 px-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-100"
        >
          <Save size={20} />
          {isSettings ? 'Salvar Configurações' : 'Salvar e Iniciar'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;