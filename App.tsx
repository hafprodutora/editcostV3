import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

import { View, Project, UserSettings, ProjectStatus } from './types';
import { INITIAL_SETTINGS } from './constants';
import Layout from './components/Layout';
import Login from './components/Login';
import Signup from './components/Signup';
import Welcome from './components/Welcome';
import Onboarding from './components/Onboarding';
import SummaryCards from './components/SummaryCards';
import ProjectTable from './components/ProjectTable';
import CreateProject from './components/CreateProject';
import ProjectDetail from './components/ProjectDetail';
import Report from './components/Report';
import { formatMinutesToDisplay, formatCurrency } from './utils/formatters';

const App: React.FC = () => {
  const [authEmail, setAuthEmail] = useState<string | null>(() => localStorage.getItem('editcost_auth_email'));
  const [view, setView] = useState<View>(() => localStorage.getItem('editcost_auth_email') ? 'dashboard' : 'login');
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Initialize fixed test user if not exists
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('editcost_users') || '[]');
    const hasTestUser = users.some((u: any) => u.email === 'heltonalvesfilms@gmail.com');
    if (!hasTestUser) {
      users.push({ email: 'heltonalvesfilms@gmail.com', password: 'teste123' });
      localStorage.setItem('editcost_users', JSON.stringify(users));
    }
  }, []);

  // Load user specific data when authEmail changes
  useEffect(() => {
    if (authEmail) {
      const savedSettings = localStorage.getItem(`editcost_settings_${authEmail}`);
      const savedProjects = localStorage.getItem(`editcost_projects_${authEmail}`);
      
      const loadedSettings = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;
      setSettings(loadedSettings);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);

      if (loadedSettings.initialized) {
        setView('dashboard');
      } else {
        setView('welcome');
      }
    } else if (view !== 'signup' && view !== 'login') {
      setView('login');
      setSettings(INITIAL_SETTINGS);
      setProjects([]);
    }
  }, [authEmail]);

  // Global Timer Engine
  useEffect(() => {
    const runningProject = projects.find(p => p.isTimerRunning);
    if (!runningProject) return;

    const interval = setInterval(() => {
      setProjects(prevProjects => prevProjects.map(p => {
        if (p.isTimerRunning) {
          const currentRemaining = p.pomodoroTimeLeft ?? (settings.pomodoroDuration * 60);
          if (currentRemaining <= 0) return { ...p, isTimerRunning: false, pomodoroTimeLeft: 0 };

          const nextTimeLeft = currentRemaining - 1;
          const newTime = p.timeSpentSeconds + 1;
          const newCost = (newTime / 3600) * p.hourlyRate;

          return { ...p, timeSpentSeconds: newTime, totalCost: newCost, pomodoroTimeLeft: nextTimeLeft };
        }
        return p;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [projects, settings.pomodoroDuration]);

  // Browser Tab Title Timer Update
  useEffect(() => {
    const runningProject = projects.find(p => p.isTimerRunning);
    document.title = runningProject?.pomodoroTimeLeft !== undefined
      ? `${formatMinutesToDisplay(runningProject.pomodoroTimeLeft)} - EditCost`
      : 'EditCost';
  }, [projects]);

  // Sync settings and projects
  useEffect(() => {
    if (authEmail) {
      localStorage.setItem(`editcost_settings_${authEmail}`, JSON.stringify(settings));
      localStorage.setItem(`editcost_projects_${authEmail}`, JSON.stringify(projects));
      if (settings.initialized && (view === 'welcome' || view === 'onboarding') && !localStorage.getItem('force_settings')) {
        setView('dashboard');
      }
    }
  }, [settings, projects, view, authEmail]);

  // Função de teste do Firebase
  const testeFirebase = async () => {
    try {
      await addDoc(collection(db, "projects"), { name: "Projeto Teste", client: "Cliente X" });
      const querySnapshot = await getDocs(collection(db, "projects"));
      querySnapshot.forEach((doc) => console.log(doc.id, doc.data()));
    } catch (error) {
      console.error("Erro no Firebase:", error);
    }
  };

  // Chama a função de teste apenas quando o App montar
  useEffect(() => {
    testeFirebase();
  }, []);

  // Login / Signup / Logout / Settings
  const handleLogin = (email: string, password: string) => {
    setLoginError(null); setSignupSuccess(null);
    const users = JSON.parse(localStorage.getItem('editcost_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) { localStorage.setItem('editcost_auth_email', email); setAuthEmail(email); }
    else setLoginError('Email ou senha incorretos');
  };

  const handleSignup = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('editcost_users') || '[]');
    if (users.some((u: any) => u.email === email)) { alert('Este email já está cadastrado'); return; }
    users.push({ email, password });
    localStorage.setItem('editcost_users', JSON.stringify(users));
    setSignupSuccess('Conta criada com sucesso. Faça login para continuar.');
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('editcost_auth_email');
    setAuthEmail(null); setLoginError(null); setSignupSuccess(null);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.removeItem('force_settings');
    setView('dashboard');
  };

  const handleOpenSettings = () => { localStorage.setItem('force_settings', 'true'); setView('onboarding'); };

  const handleCreateProject = (data: Omit<Project, 'id' | 'number' | 'status' | 'timeSpentSeconds' | 'totalCost' | 'createdAt' | 'hourlyRate'>) => {
    const newProject: Project = {
      ...data, id: crypto.randomUUID(), number: projects.length + 1, status: 'Pausado',
      hourlyRate: settings.hourlyRate, timeSpentSeconds: 0, totalCost: 0,
      createdAt: Date.now(), pomodoroTimeLeft: settings.pomodoroDuration * 60, isTimerRunning: false
    };
    setProjects([newProject, ...projects]); setView('dashboard');
  };

  const handleUpdateProject = useCallback((updated: Project) => {
    setProjects(prev => prev.map(p => updated.isTimerRunning && p.id !== updated.id ? { ...p, isTimerRunning: false } : p.id === updated.id ? updated : p));
  }, []);

  const handleConcludeProject = (project: Project) => {
    const updated = { ...project, status: 'Concluído' as ProjectStatus, isTimerRunning: false, completedAt: Date.now() };
    handleUpdateProject(updated); setActiveProjectId(updated.id); setView('report');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Deseja realmente excluir este projeto? Esta ação não pode ser desfeita.')) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const runningProject = projects.find(p => p.isTimerRunning);

  const renderContent = () => {
    if (!authEmail) {
      if (view === 'signup') return <Signup onSignup={handleSignup} onBackToLogin={() => setView('login')} />;
      return <Login onLogin={handleLogin} onNavigateToSignup={() => { setLoginError(null); setSignupSuccess(null); setView('signup'); }} externalError={loginError} successMessage={signupSuccess} />;
    }

    switch (view) {
      case 'welcome': return <Welcome onStart={() => setView('onboarding')} />;
      case 'onboarding': return <Onboarding settings={settings} onSave={handleSaveSettings} />;
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Seu Dashboard</h2>
              <button onClick={() => setView('create-project')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">+ Novo Projeto</button>
            </div>

            {runningProject && (
              <div onClick={() => { setActiveProjectId(runningProject.id); setView('project-detail'); }}
                   className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between cursor-pointer hover:bg-indigo-100 transition-all shadow-sm group animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
                    <div className="w-3 h-3 bg-red-500 rounded-full relative" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Em edição agora</p>
                    <p className="text-lg font-bold text-gray-900 leading-tight">{runningProject.name} <span className="text-gray-400 font-normal">({runningProject.client})</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-8 font-mono">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Timer</p>
                    <p className="text-2xl font-black text-indigo-600">{formatMinutesToDisplay(runningProject.pomodoroTimeLeft ?? 0)}</p>
                  </div>
                  <div className="h-8 w-px bg-indigo-200 hidden sm:block" />
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Custo Atual</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(runningProject.totalCost, settings.currency)}</p>
                  </div>
                </div>
              </div>
            )}

            <SummaryCards totalSeconds={projects.reduce((a,b)=>a+b.timeSpentSeconds,0)} totalCost={projects.reduce((a,b)=>a+b.totalCost,0)} inProgress={projects.filter(p=>p.status==='Em edição').length} completed={projects.filter(p=>p.status==='Concluído').length} currency={settings.currency} />

            <ProjectTable projects={projects} currency={settings.currency} onView={p=>{setActiveProjectId(p.id); setView('project-detail');}} onReport={p=>{setActiveProjectId(p.id); setView('report');}} onDelete={handleDeleteProject} />
          </div>
        );
      case 'create-project': return <CreateProject settings={settings} onSave={handleCreateProject} onBack={()=>setView('dashboard')} />;
      case 'project-detail': return activeProject ? <ProjectDetail project={activeProject} settings={settings} onUpdate={handleUpdateProject} onBack={()=>setView('dashboard')} onConclude={handleConcludeProject} /> : null;
      case 'report': return activeProject ? <Report project={activeProject} settings={settings} onBack={()=>setView('dashboard')} /> : null;
      default: return <div>View não implementada.</div>;
    }
  };

  return (
    <Layout currentView={view} userEmail={authEmail} onNavigate={(v) => {
      if (v === 'logout') handleLogout();
      else if (v === 'onboarding') handleOpenSettings();
      else setView(v);
    }}>
      {renderContent()}
      <Analytics />
    </Layout>
  );
};

export default App;
