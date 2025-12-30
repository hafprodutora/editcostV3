
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import MonthlyReport from './components/MonthlyReport';
import { formatMinutesToDisplay, formatCurrency } from './utils/formatters';
import { Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [authEmail, setAuthEmail] = useState<string | null>(() => {
    return localStorage.getItem('editcost_auth_email');
  });
  
  const [view, setView] = useState<View>(() => {
    const email = localStorage.getItem('editcost_auth_email');
    return email ? 'dashboard' : 'login';
  });
  
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  const [dashMonth, setDashMonth] = useState(new Date().getMonth());
  const [dashYear, setDashYear] = useState(new Date().getFullYear());

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear; i >= 2023; i--) arr.push(i);
    return arr;
  }, []);

  // Auto-dismiss feedback messages
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  useEffect(() => {
    if (signupError) {
      const timer = setTimeout(() => setSignupError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [signupError]);

  useEffect(() => {
    if (signupSuccess) {
      const timer = setTimeout(() => setSignupSuccess(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [signupSuccess]);

  useEffect(() => {
    if (authEmail) {
      const savedSettings = localStorage.getItem(`editcost_settings_${authEmail}`);
      const savedProjects = localStorage.getItem(`editcost_projects_${authEmail}`);
      const loadedSettings = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;
      setSettings(loadedSettings);
      setProjects(savedProjects ? JSON.parse(savedProjects) : []);
      if (loadedSettings.initialized) setView('dashboard'); else setView('welcome');
    } else if (view !== 'signup' && view !== 'login') {
      setView('login');
      setSettings(INITIAL_SETTINGS);
      setProjects([]);
    }
  }, [authEmail]);

  // Updated Timer Engine with Subtask Support
  useEffect(() => {
    const runningProject = projects.find(p => p.isTimerRunning);
    if (!runningProject) return;

    const interval = setInterval(() => {
      setProjects(prevProjects => prevProjects.map(p => {
        if (p.isTimerRunning) {
          const currentRemaining = p.pomodoroTimeLeft ?? (settings.pomodoroDuration * 60);
          if (currentRemaining <= 0) return { ...p, isTimerRunning: false, pomodoroTimeLeft: 0 };

          const nextTimeLeft = currentRemaining - 1;
          const newTotalTime = p.timeSpentSeconds + 1;

          // Update Subtasks if complex
          let updatedDeliverables = p.deliverables || [];
          if (p.type === 'complex' && p.activeDeliverableId) {
            updatedDeliverables = updatedDeliverables.map(d => 
              d.id === p.activeDeliverableId ? { ...d, trackedSeconds: d.trackedSeconds + 1 } : d
            );
          }
          
          const extraCostsTotal = (p.extraCosts || []).reduce((acc, c) => acc + c.value, 0);
          const newCost = (newTotalTime / 3600) * p.hourlyRate + extraCostsTotal;
          
          return {
            ...p,
            timeSpentSeconds: newTotalTime,
            totalCost: newCost,
            pomodoroTimeLeft: nextTimeLeft,
            deliverables: updatedDeliverables
          };
        }
        return p;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [projects.some(p => p.isTimerRunning), settings.pomodoroDuration]);

  useEffect(() => {
    if (authEmail) {
      localStorage.setItem(`editcost_settings_${authEmail}`, JSON.stringify(settings));
    }
  }, [settings, authEmail]);

  useEffect(() => {
    if (authEmail) {
      localStorage.setItem(`editcost_projects_${authEmail}`, JSON.stringify(projects));
    }
  }, [projects, authEmail]);

  const handleLogin = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('editcost_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('editcost_auth_email', email);
      setAuthEmail(email);
    } else {
      setLoginError('Email ou senha incorretos');
    }
  };

  const handleSignup = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('editcost_users') || '[]');
    if (users.some((u: any) => u.email === email)) { 
      setSignupError('Esta conta já existe. Faça login ou use outro e-mail.'); 
      return; 
    }
    users.push({ email, password });
    localStorage.setItem('editcost_users', JSON.stringify(users));
    setSignupSuccess('Conta criada com sucesso. Faça login.');
    setSignupError(null);
    setView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('editcost_auth_email');
    setAuthEmail(null);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setView('dashboard');
  };

  const handleCreateProject = (data: Omit<Project, 'id' | 'number' | 'status' | 'timeSpentSeconds' | 'totalCost' | 'createdAt'>) => {
    const extraCostsTotal = (data.extraCosts || []).reduce((acc, c) => acc + c.value, 0);
    const newProject: Project = {
      ...data,
      id: crypto.randomUUID(),
      number: projects.length + 1,
      status: 'Pausado',
      hourlyRate: settings.hourlyRate,
      timeSpentSeconds: 0,
      totalCost: extraCostsTotal,
      createdAt: Date.now(),
      pomodoroTimeLeft: settings.pomodoroDuration * 60,
      isTimerRunning: false
    };
    setProjects([newProject, ...projects]);
    setView('dashboard');
  };

  const handleUpdateProject = useCallback((updated: Project) => {
    setProjects(prev => prev.map(p => {
      if (updated.isTimerRunning && p.id !== updated.id) return { ...p, isTimerRunning: false };
      return p.id === updated.id ? updated : p;
    }));
  }, []);

  const handleConcludeProject = (project: Project) => {
    const updated = { ...project, status: 'Concluído' as ProjectStatus, isTimerRunning: false, completedAt: Date.now() };
    handleUpdateProject(updated);
    setActiveProjectId(updated.id);
    setView('report');
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Excluir projeto?')) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const runningProject = projects.find(p => p.isTimerRunning);
  const filteredDashboardProjects = useMemo(() => projects.filter(p => {
    const d = new Date(p.startDate);
    return d.getMonth() === dashMonth && d.getFullYear() === dashYear;
  }), [projects, dashMonth, dashYear]);

  return (
    <Layout currentView={view} userEmail={authEmail} onNavigate={(v) => {
      if (v === 'logout') handleLogout();
      else if (v === 'onboarding') setView('onboarding');
      else setView(v);
    }}>
      {view === 'login' ? <Login onLogin={handleLogin} onNavigateToSignup={() => setView('signup')} externalError={loginError} successMessage={signupSuccess} /> : null}
      {view === 'signup' ? <Signup onSignup={handleSignup} onBackToLogin={() => setView('login')} externalError={signupError} /> : null}
      {view === 'welcome' ? <Welcome onStart={() => setView('onboarding')} /> : null}
      {view === 'onboarding' ? <Onboarding settings={settings} onSave={handleSaveSettings} /> : null}
      {view === 'dashboard' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Seu Dashboard</h2>
            <button onClick={() => setView('create-project')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">+ Novo Projeto</button>
          </div>
          {runningProject && (
            <div onClick={() => { setActiveProjectId(runningProject.id); setView('project-detail'); }} className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase">Em edição agora</p>
                  <p className="text-lg font-bold text-gray-900">{runningProject.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                 <p className="text-2xl font-black text-indigo-600">{formatMinutesToDisplay(runningProject.pomodoroTimeLeft ?? 0)}</p>
                 <p className="text-2xl font-black text-emerald-600">{formatCurrency(runningProject.totalCost, settings.currency)}</p>
              </div>
            </div>
          )}
          <SummaryCards totalSeconds={filteredDashboardProjects.reduce((a, b) => a + b.timeSpentSeconds, 0)} totalCost={filteredDashboardProjects.reduce((a, b) => a + b.totalCost, 0)} inProgress={filteredDashboardProjects.filter(p => p.status === 'Em edição').length} completed={filteredDashboardProjects.filter(p => p.status === 'Concluído').length} currency={settings.currency} />
          <ProjectTable projects={filteredDashboardProjects} currency={settings.currency} onView={(p) => { setActiveProjectId(p.id); setView('project-detail'); }} onReport={(p) => { setActiveProjectId(p.id); setView('report'); }} onDelete={handleDeleteProject} />
        </div>
      ) : null}
      {view === 'create-project' ? <CreateProject settings={settings} onSave={handleCreateProject} onBack={() => setView('dashboard')} /> : null}
      {view === 'project-detail' && activeProject ? <ProjectDetail project={activeProject} settings={settings} onUpdate={handleUpdateProject} onBack={() => setView('dashboard')} onConclude={handleConcludeProject} /> : null}
      {view === 'report' && activeProject ? <Report project={activeProject} settings={settings} onBack={() => setView('dashboard')} /> : null}
      {view === 'monthly-report' ? <MonthlyReport projects={projects} settings={settings} onBack={() => setView('dashboard')} onViewProject={(p) => { setActiveProjectId(p.id); setView('project-detail'); }} /> : null}
    </Layout>
  );
};

export default App;
