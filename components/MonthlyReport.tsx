import React, { useState, useMemo } from 'react';
import { Project, UserSettings } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { ArrowLeft, Calendar, TrendingUp, TrendingDown, Clock, DollarSign, Wallet, Percent, PieChart } from 'lucide-react';

interface MonthlyReportProps {
  projects: Project[];
  settings: UserSettings;
  onBack: () => void;
  onViewProject: (project: Project) => void;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ projects, settings, onBack, onViewProject }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = useMemo(() => {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear; i >= startYear; i--) arr.push(i);
    return arr;
  }, []);

  const getMonthData = (month: number, year: number) => {
    const filtered = projects.filter(p => {
      const d = new Date(p.startDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const hours = filtered.reduce((acc, p) => acc + p.timeSpentSeconds, 0);
    const cost = filtered.reduce((acc, p) => acc + p.totalCost, 0);
    const earned = filtered.reduce((acc, p) => acc + p.fixedPrice, 0);
    const profit = earned - cost;

    return { filtered, hours, cost, earned, profit };
  };

  const currentData = useMemo(() => getMonthData(selectedMonth, selectedYear), [selectedMonth, selectedYear, projects]);
  
  const prevMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const prevData = useMemo(() => getMonthData(prevMonthDate.getMonth(), prevMonthDate.getFullYear()), [selectedMonth, selectedYear, projects]);

  const calculateDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const diffHours = calculateDiff(currentData.hours, prevData.hours);
  const diffProfit = calculateDiff(currentData.profit, prevData.profit);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </button>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Relatório Mensal</h2>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <Calendar size={18} className="text-indigo-500 ml-2" />
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer outline-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Metas e Comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock size={20} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${diffHours >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {diffHours >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(diffHours).toFixed(0)}%
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Horas Trabalhadas</p>
          <p className="text-2xl font-black text-gray-900">{formatTime(currentData.hours)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Ganho</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(currentData.earned, settings.currency)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Custo Operacional</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(currentData.cost, settings.currency)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <PieChart size={20} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${diffProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {diffProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(diffProfit).toFixed(0)}%
            </div>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
          <p className="text-2xl font-black text-indigo-600">{formatCurrency(currentData.profit, settings.currency)}</p>
        </div>
      </div>

      {/* Gráfico Simples de Barra para Comparação Visual */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-500" />
          Volume de Projetos vs Mês Anterior
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
              <span>Mês Anterior ({months[prevMonthDate.getMonth()]})</span>
              <span>{formatCurrency(prevData.profit, settings.currency)}</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gray-300 h-full transition-all duration-1000" 
                style={{ width: `${prevData.profit > 0 ? (prevData.profit / Math.max(currentData.profit, prevData.profit)) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-indigo-600 uppercase">
              <span>Mês Atual ({months[selectedMonth]})</span>
              <span>{formatCurrency(currentData.profit, settings.currency)}</span>
            </div>
            <div className="w-full bg-indigo-50 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-1000" 
                style={{ width: `${currentData.profit > 0 ? (currentData.profit / Math.max(currentData.profit, prevData.profit)) * 100 : 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Projetos do Mês */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-800">Projetos de {months[selectedMonth]} {selectedYear}</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentData.filtered.length} Projetos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Projeto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Horas</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo Operacional</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Ganho</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentData.filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">Nenhum projeto registrado neste mês.</td>
                </tr>
              ) : (
                currentData.filtered.map(p => {
                  const profit = p.fixedPrice - p.totalCost;
                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => onViewProject(p)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">{p.client}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{formatTime(p.timeSpentSeconds)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatCurrency(p.totalCost, settings.currency)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatCurrency(p.fixedPrice, settings.currency)}</td>
                      <td className={`px-6 py-4 text-sm font-black text-right ${profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                        {formatCurrency(profit, settings.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {currentData.filtered.length > 0 && (
              <tfoot className="bg-gray-50/80">
                <tr>
                  <td className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Totais do Mês</td>
                  <td className="px-6 py-4 text-sm font-black font-mono text-gray-900">{formatTime(currentData.hours)}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-600">{formatCurrency(currentData.cost, settings.currency)}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600">{formatCurrency(currentData.earned, settings.currency)}</td>
                  <td className={`px-6 py-4 text-base font-black text-right ${currentData.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {formatCurrency(currentData.profit, settings.currency)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;