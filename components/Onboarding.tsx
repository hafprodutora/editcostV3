import React, { useState, useEffect } from 'react';
import { UserSettings, ServiceTemplate, ComplexProjectTemplate, ExtraCost } from '../types';
import { POMODORO_OPTIONS, BREAK_OPTIONS } from '../constants';
import { Save, Calculator, Landmark, Clock, CalendarDays, History, Trash2, Plus, Briefcase, LayoutTemplate, Package, DollarSign, Edit3, X, Video, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface OnboardingProps {
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ settings, onSave }) => {
  const isSettings = settings.initialized;
  
  const [formData, setFormData] = useState<UserSettings>({
    ...settings,
    daysPerWeek: settings.daysPerWeek || 5,
    simpleTemplates: settings.simpleTemplates || [],
    complexTemplates: settings.complexTemplates || [],
    hourlyRateHistory: settings.hourlyRateHistory || []
  });

  const [desiredSalary, setDesiredSalary] = useState(5000);
  const [dailyAverage, setDailyAverage] = useState(4); 

  // Collapsible state - default to collapsed
  const [simpleOpen, setSimpleOpen] = useState(false);
  const [complexOpen, setComplexOpen] = useState(false);

  // Simple Template State
  const [editingSimpleId, setEditingSimpleId] = useState<string | null>(null);
  const [simpleTemplateForm, setSimpleTemplateForm] = useState({ name: '', price: 0, description: '' });

  // Complex Template State
  const [editingComplexId, setEditingComplexId] = useState<string | null>(null);
  const [complexTemplateForm, setComplexTemplateForm] = useState<Omit<ComplexProjectTemplate, 'id'>>({
    name: '',
    deliverables: [],
    extraCosts: [],
    defaultPrice: 0
  });

  const formatDailyAverageDisplay = (val: number) => {
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return m === 0 ? `${h}h` : `${h}h${m}`;
  };

  const weeklyAverage = dailyAverage * formData.daysPerWeek;
  const monthlyHours = weeklyAverage * 4.33;

  useEffect(() => {
    if (monthlyHours > 0) {
      const calculatedRate = desiredSalary / monthlyHours;
      setFormData(prev => ({ ...prev, hourlyRate: Number(calculatedRate.toFixed(2)) }));
    }
  }, [desiredSalary, dailyAverage, formData.daysPerWeek]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let updatedHistory = [...formData.hourlyRateHistory];
    if (!isSettings || formData.hourlyRate !== settings.hourlyRate) {
      updatedHistory.unshift({ value: formData.hourlyRate, date: Date.now() });
      updatedHistory = updatedHistory.slice(0, 10);
    }
    onSave({ ...formData, hourlyRateHistory: updatedHistory, initialized: true });
  };

  // Simple Template Handlers
  const saveSimpleTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!simpleTemplateForm.name) return;
    const finalPrice = isNaN(simpleTemplateForm.price) ? 0 : simpleTemplateForm.price;
    if (editingSimpleId) {
      setFormData({
        ...formData,
        simpleTemplates: formData.simpleTemplates.map(t => t.id === editingSimpleId ? { ...simpleTemplateForm, price: finalPrice, id: t.id } : t)
      });
    } else {
      const newTemp: ServiceTemplate = { ...simpleTemplateForm, defaultPrice: finalPrice, id: crypto.randomUUID() };
      setFormData({ ...formData, simpleTemplates: [...formData.simpleTemplates, newTemp] });
    }
    setSimpleTemplateForm({ name: '', price: 0, description: '' });
    setEditingSimpleId(null);
  };

  const editSimpleTemplate = (e: React.MouseEvent, t: ServiceTemplate) => {
    e.stopPropagation();
    setEditingSimpleId(t.id);
    setSimpleTemplateForm({ name: t.name, price: t.defaultPrice, description: t.description || '' });
  };

  const removeSimpleTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFormData({ ...formData, simpleTemplates: formData.simpleTemplates.filter(x => x.id !== id) });
  };

  // Complex Template Handlers
  const saveComplexTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!complexTemplateForm.name) return;
    const finalPrice = isNaN(complexTemplateForm.defaultPrice || 0) ? 0 : complexTemplateForm.defaultPrice;
    if (editingComplexId) {
      setFormData({
        ...formData,
        complexTemplates: formData.complexTemplates.map(t => t.id === editingComplexId ? { ...complexTemplateForm, defaultPrice: finalPrice, id: t.id } : t)
      });
    } else {
      const newTemp: ComplexProjectTemplate = { ...complexTemplateForm, defaultPrice: finalPrice, id: crypto.randomUUID() };
      setFormData({ ...formData, complexTemplates: [...formData.complexTemplates, newTemp] });
    }
    setComplexTemplateForm({ name: '', deliverables: [], extraCosts: [], defaultPrice: 0 });
    setEditingComplexId(null);
  };

  const editComplexTemplate = (e: React.MouseEvent, t: ComplexProjectTemplate) => {
    e.stopPropagation();
    setEditingComplexId(t.id);
    setComplexTemplateForm({ name: t.name, deliverables: t.deliverables, extraCosts: t.extraCosts, defaultPrice: t.defaultPrice || 0 });
  };

  const removeComplexTemplate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFormData({ ...formData, complexTemplates: formData.complexTemplates.filter(x => x.id !== id) });
  };

  const addDeliverableToForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setComplexTemplateForm({
      ...complexTemplateForm,
      deliverables: [...complexTemplateForm.deliverables, { id: crypto.randomUUID(), name: '' }]
    });
  };

  const addExtraCostToForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setComplexTemplateForm({
      ...complexTemplateForm,
      extraCosts: [...complexTemplateForm.extraCosts, { id: crypto.randomUUID(), name: '', value: 0 }]
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSettings ? 'Configurações' : 'Configurar EditCost'}
          </h1>
          <p className="text-gray-500 mt-2">Defina seus custos base e modelos de projetos.</p>
        </div>

        <div className="space-y-8">
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
                  type="range" min="1000" max="30000" step="500" value={desiredSalary}
                  onChange={(e) => setDesiredSalary(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500">Média Diária</label>
                    <span className="text-indigo-600 font-bold text-xs">{formatDailyAverageDisplay(dailyAverage)}</span>
                  </div>
                  <input
                    type="range" min="1" max="16" step="0.5" value={dailyAverage}
                    onChange={(e) => setDailyAverage(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex gap-1">
                    {[2, 4, 8].map(h => (
                      <button key={h} type="button" onClick={() => setDailyAverage(h)} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">{h}h</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500">Dias/Semana</label>
                    <span className="text-indigo-600 font-bold text-xs">{formData.daysPerWeek}d</span>
                  </div>
                  <input
                    type="range" min="1" max="7" step="1" value={formData.daysPerWeek}
                    onChange={(e) => setFormData({ ...formData, daysPerWeek: Number(e.target.value) })}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex gap-1">
                    {[3, 5, 7].map(d => (
                      <button key={d} type="button" onClick={() => setFormData({ ...formData, daysPerWeek: d })} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">{d}d</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-indigo-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Seu Valor/Hora:</span>
              <span className="text-xl font-black text-indigo-700">{formatCurrency(formData.hourlyRate, formData.currency)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pomodoro</label>
              <div className="flex gap-2">
                {POMODORO_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => setFormData({ ...formData, pomodoroDuration: opt })} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${formData.pomodoroDuration === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>{opt}m</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pausa</label>
              <div className="flex gap-2">
                {BREAK_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => setFormData({ ...formData, breakTime: opt })} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${formData.breakTime === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}>{opt}m</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Modelos Simples - COLLAPSIBLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button 
          onClick={() => setSimpleOpen(!simpleOpen)}
          className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Video size={18} className="text-indigo-500" />
            <div className="text-left">
              <span className="text-gray-900 font-bold text-sm uppercase tracking-wider block">Modelos de Projetos Simples</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {formData.simpleTemplates.length > 0 
                  ? `${formData.simpleTemplates.length} ${formData.simpleTemplates.length === 1 ? 'modelo criado' : 'modelos criados'}` 
                  : 'Nenhum modelo criado'}
              </span>
            </div>
          </div>
          {simpleOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
        </button>
        
        {simpleOpen && (
          <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-2">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
              <input 
                type="text" 
                placeholder="Nome do Modelo (ex: Reel Premium)" 
                value={simpleTemplateForm.name} 
                onChange={(e) => setSimpleTemplateForm({ ...simpleTemplateForm, name: e.target.value })} 
                className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
              />
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">R$</span>
                  <input 
                    type="number" 
                    placeholder="Preço Base" 
                    value={isNaN(simpleTemplateForm.price) ? '' : simpleTemplateForm.price === 0 ? '' : simpleTemplateForm.price} 
                    onChange={(e) => setSimpleTemplateForm({ ...simpleTemplateForm, price: e.target.value === '' ? 0 : Number(e.target.value) })} 
                    className="w-full pl-8 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  />
                </div>
              </div>
              <button 
                onClick={saveSimpleTemplate} 
                className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                {editingSimpleId ? 'Atualizar Modelo' : 'Criar Modelo Simples'}
              </button>
              {editingSimpleId && (
                <button 
                  onClick={() => { setEditingSimpleId(null); setSimpleTemplateForm({ name: '', price: 0, description: '' }); }} 
                  className="w-full text-xs text-gray-400 hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="space-y-2">
              {formData.simpleTemplates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{formatCurrency(t.defaultPrice, formData.currency)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => editSimpleTemplate(e, t)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit3 size={16} /></button>
                    <button onClick={(e) => removeSimpleTemplate(e, t.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gerenciamento de Modelos Complexos - COLLAPSIBLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button 
          onClick={() => setComplexOpen(!complexOpen)}
          className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={18} className="text-indigo-500" />
            <div className="text-left">
              <span className="text-gray-900 font-bold text-sm uppercase tracking-wider block">Modelos de Projetos Complexos</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {formData.complexTemplates.length > 0 
                  ? `${formData.complexTemplates.length} ${formData.complexTemplates.length === 1 ? 'modelo criado' : 'modelos criados'}` 
                  : 'Nenhum modelo criado'}
              </span>
            </div>
          </div>
          {complexOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
        </button>

        {complexOpen && (
          <div className="px-8 pb-8 space-y-6 animate-in slide-in-from-top-2">
            <div className="bg-gray-50 p-6 rounded-2xl border border-indigo-100 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nome do Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Casamento Completo" 
                  value={complexTemplateForm.name} 
                  onChange={(e) => setComplexTemplateForm({ ...complexTemplateForm, name: e.target.value })} 
                  className="w-full px-4 py-2 border rounded-xl outline-none text-sm" 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entregáveis (Subtasks)</p>
                  <button onClick={addDeliverableToForm} className="text-indigo-600 text-[10px] font-black uppercase">+ Adicionar</button>
                </div>
                {complexTemplateForm.deliverables.map((d, i) => (
                  <div key={d.id} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Nome da tarefa" 
                      value={d.name} 
                      onChange={(e) => {
                        const updated = [...complexTemplateForm.deliverables];
                        updated[i].name = e.target.value;
                        setComplexTemplateForm({ ...complexTemplateForm, deliverables: updated });
                      }} 
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm" 
                    />
                    <button 
                      onClick={() => setComplexTemplateForm({ ...complexTemplateForm, deliverables: complexTemplateForm.deliverables.filter(x => x.id !== d.id) })} 
                      className="text-gray-300 hover:text-red-500"
                    >
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custos Extras Base</p>
                  <button onClick={addExtraCostToForm} className="text-indigo-600 text-[10px] font-black uppercase">+ Adicionar</button>
                </div>
                {complexTemplateForm.extraCosts.map((c, i) => (
                  <div key={c.id} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Descrição" 
                      value={c.name} 
                      onChange={(e) => {
                        const updated = [...complexTemplateForm.extraCosts];
                        updated[i].name = e.target.value;
                        setComplexTemplateForm({ ...complexTemplateForm, extraCosts: updated });
                      }} 
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm" 
                    />
                    <input 
                      type="number" 
                      placeholder="Valor" 
                      value={isNaN(c.value) ? '' : c.value === 0 ? '' : c.value} 
                      onChange={(e) => {
                        const updated = [...complexTemplateForm.extraCosts];
                        updated[i].value = e.target.value === '' ? 0 : Number(e.target.value);
                        setComplexTemplateForm({ ...complexTemplateForm, extraCosts: updated });
                      }} 
                      className="w-20 px-3 py-1.5 border rounded-lg text-sm" 
                    />
                    <button 
                      onClick={() => setComplexTemplateForm({ ...complexTemplateForm, extraCosts: complexTemplateForm.extraCosts.filter(x => x.id !== c.id) })} 
                      className="text-gray-300 hover:text-red-500"
                    >
                      <X size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preço Sugerido</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={isNaN(complexTemplateForm.defaultPrice || 0) ? '' : complexTemplateForm.defaultPrice === 0 ? '' : complexTemplateForm.defaultPrice} 
                  onChange={(e) => setComplexTemplateForm({ ...complexTemplateForm, defaultPrice: e.target.value === '' ? 0 : Number(e.target.value) })} 
                  className="w-full px-4 py-2 border rounded-xl outline-none text-sm" 
                />
              </div>

              <button 
                onClick={saveComplexTemplate} 
                className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                {editingComplexId ? 'Atualizar Modelo' : 'Criar Modelo Complexo'}
              </button>
              {editingComplexId && (
                <button 
                  onClick={() => { setEditingComplexId(null); setComplexTemplateForm({ name: '', deliverables: [], extraCosts: [], defaultPrice: 0 }); }} 
                  className="w-full text-xs text-gray-400 hover:underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="space-y-3">
              {formData.complexTemplates.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-100 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.deliverables.length} Subtasks • {formatCurrency(t.defaultPrice || 0, formData.currency)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => editComplexTemplate(e, t)} className="p-2 text-gray-400 hover:text-indigo-600"><Edit3 size={18}/></button>
                    <button onClick={(e) => removeComplexTemplate(e, t.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        type="button" 
        onClick={() => handleSubmit()}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
      >
        <Save size={20} />
        Salvar Todas as Configurações
      </button>
    </div>
  );
};

export default Onboarding;