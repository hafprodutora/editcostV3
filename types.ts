export type ProjectStatus = 'Pausado' | 'Em edição' | 'Concluído';

export interface UserSettings {
  hourlyRate: number;
  pomodoroDuration: number; // minutes
  breakTime: number; // minutes
  currency: string;
  initialized: boolean;
}

export interface Project {
  id: string;
  number: number;
  name: string;
  client: string;
  estimatedHours: number;
  hourlyRate: number; // Rate at time of creation
  notes: string;
  status: ProjectStatus;
  timeSpentSeconds: number;
  totalCost: number;
  createdAt: number;
  startDate: number; // Project start date timestamp
  completedAt?: number;
  pomodoroTimeLeft?: number; // Persists the current session's remaining time
  isTimerRunning?: boolean; // Track if the pomodoro is active for this project
}

export type View = 'login' | 'signup' | 'welcome' | 'onboarding' | 'dashboard' | 'create-project' | 'project-detail' | 'report';