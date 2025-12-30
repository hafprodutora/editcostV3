
import React, { useState, useEffect } from 'react';
import { Project, UserSettings, ServiceTemplate, Deliverable, ExtraCost, ComplexProjectTemplate } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Plus, ArrowLeft, DollarSign, Briefcase, ListFilter, Trash2, Video, Package, Info, LayoutTemplate, Clock } from 'lucide-react';

interface CreateProjectProps {
  settings: UserSettings;
  onSave: (project: Omit<Project, 'id' | 'number' | 'status' | 'timeSpentSeconds' | 'totalCost' | 'createdAt'>) => void;
  onBack: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ settings, onSave, onBack }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [projectType, setProjectType] = useState<'simple' | 'complex'>('simple');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    fixedPrice: 0 as number | '',
    notes: '',
    startDate: today,
  });

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);

  // Snapshot logic when template changes
  useEffect(() => {
    if (selectedTemplateId === 'custom') return;

    if (projectType === 'simple') {
      const template = settings.simpleTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        setFormData(prev => ({ ...prev, name: template.name, fixedPrice: isNaN(template.defaultPrice) ? 0 : template.defaultPrice }));
        setDeliverables([]);
        setExtraCosts([]);
      }
    } else {
      const template = settings.complexTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        setFormData(prev => ({ ...prev, name: template.name, fixedPrice: isNaN(template.defaultPrice || 0) ? 0 : template.defaultPrice || 0 }));
        setDeliverables(template.deliverables.map(d => ({
          id: crypto.randomUUID(), // New ID for project instance
          name: d.name,
          trackedSeconds: 0,
          status: 'Pendente' as const
        })));
        setExtraCosts(template.extraCosts.map(e => ({ ...e, id: crypto.randomUUID(), value: isNaN(e.value) ? 0 : e.value })));
      }
    }
  }, [selectedTemplateId, projectType, settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safePrice = formData.fixedPrice === '' || isNaN(Number(formData.fixedPrice)) ? 0 : Number(formData.fixedPrice);
    onSave({
      ...formData,
      type: projectType,
      estimatedHours: 0, // Requirements: initial hours start at zero
      fixedPrice: safePrice,
      startDate: new Date(formData.startDate).getTime(),
      deliverables: projectType === 'complex' ? deliverables : [],
      extraCosts: projectType === 'complex' ? extraCosts : []
    });
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, { id: crypto.randomUUID(), name: '', trackedSeconds: 0, status: 'Pendente' }]);
  };

  const addExtraCost = () => {
    setExtraCosts([...extraCosts, { id: crypto.randomUUID(), name: '', value: 0 }]);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors font-medium text-sm">
        <ArrowLeft size={18} />
        Voltar ao Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar Novo Projeto</h2>
          <p className="text-sm text-gray-500">Selecione o tipo e comece a rastrear seu tempo.</p>
        </div>

        {/* Step 1: Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { setProjectType('simple'); setSelectedTemplateId('custom'); }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${projectType === 'simple' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 ring-2 ring-indigo-100' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
            <Video size={24} />
            <span className="font-bold text-sm">Projeto Simples</span>
            <span className="text-[10px] uppercase font-black opacity-60">Vídeo Único</span>
          </button>
          <button onClick={() => { setProjectType('complex'); setSelectedTemplateId('custom'); }} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${projectType === 'complex' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 ring-2 ring-indigo-100' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
            <Package size={24} />
            <span className="font-bold text-sm">Projeto Complexo</span>
            <span className="text-[10px] uppercase font-black opacity-60">Múltiplas Subtasks</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 2: Template Selection */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutTemplate size={14} className="text-indigo-500" />
              Seleção de Modelo
            </h3>
            <div className="relative">
              <ListFilter className="absolute left-3 top-2.5 text-indigo-500" size={18} />
              <select 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-indigo-50/30 text-sm font-bold text-indigo-700"
              >
                <option value="custom">Configuração Personalizada (Sem Modelo)</option>
                {projectType === 'simple' ? 
                  settings.simpleTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>) :
                  settings.complexTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                }
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-indigo-500" />
              Detalhes do Projeto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nome</label>
                <input type="text" placeholder="Nome do projeto" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cliente</label>
                <input type="text" placeholder="Nome do cliente" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Preço Final Acordado</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">R$</span>
                  <input type="number" placeholder="0.00" value={formData.fixedPrice === 0 ? '' : formData.fixedPrice} onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value === '' ? 0 : Number(e.target.value) })} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none text-sm font-bold tabular-nums" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Data de Início</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm" required />
              </div>
            </div>
          </div>

          {projectType === 'complex' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-indigo-500" />Subtasks</h3>
                  <button type="button" onClick={addDeliverable} className="text-indigo-600 text-[10px] font-black uppercase">+ Adicionar</button>
                </div>
                <div className="space-y-3">
                  {deliverables.map((del, i) => (
                    <div key={del.id} className="flex gap-3 items-center">
                      <input type="text" placeholder="Nome da subtask" value={del.name} onChange={(e) => {
                        const updated = [...deliverables];
                        updated[i].name = e.target.value;
                        setDeliverables(updated);
                      }} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" required />
                      <button type="button" onClick={() => setDeliverables(deliverables.filter(x => x.id !== del.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} className="text-indigo-500" />Custos Extras</h3>
                  <button type="button" onClick={addExtraCost} className="text-indigo-600 text-[10px] font-black uppercase">+ Adicionar</button>
                </div>
                <div className="space-y-3">
                  {extraCosts.map((cost, i) => (
                    <div key={cost.id} className="flex gap-3 items-center">
                      <input type="text" placeholder="Descrição" value={cost.name} onChange={(e) => {
                        const updated = [...extraCosts];
                        updated[i].name = e.target.value;
                        setExtraCosts(updated);
                      }} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" required />
                      <div className="relative w-32">
                        <span className="absolute left-2 top-2 text-[10px] text-gray-300 font-black">R$</span>
                        <input type="number" placeholder="Valor" value={cost.value === 0 ? '' : cost.value} onChange={(e) => {
                          const updated = [...extraCosts];
                          updated[i].value = e.target.value === '' ? 0 : Number(e.target.value);
                          setExtraCosts(updated);
                        }} className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none" required />
                      </div>
                      <button type="button" onClick={() => setExtraCosts(extraCosts.filter(x => x.id !== cost.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex justify-between items-center">
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Projeto</p>
               <p className="text-2xl font-black text-indigo-700">{formatCurrency(Number(formData.fixedPrice) || 0, settings.currency)}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-end gap-1"><Clock size={10} /> Início</p>
               <p className="text-sm font-bold text-gray-600">0h tracked</p>
             </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 px-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            Criar Projeto e Iniciar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
