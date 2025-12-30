export type ProjectStatus = 'Pausado' | 'Em edição' | 'Concluído';
export type DeliverableStatus = 'Pendente' | 'Em andamento' | 'Concluído';

export interface HourlyRateEntry {
  value: number;
  date: number;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  defaultPrice: number;
  description?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  estimatedHours?: number; // Keep for backward compatibility
  trackedSeconds: number; // Real tracked time
  status: DeliverableStatus;
}

export interface ExtraCost {
  id: string;
  name: string;
  value: number;
}

export interface ComplexProjectTemplate {
  id: string;
  name: string;
  deliverables: { id: string; name: string }[];
  extraCosts: ExtraCost[];
  defaultPrice?: number;
}

export interface UserSettings {
  hourlyRate: number;
  pomodoroDuration: number;
  breakTime: number;
  currency: string;
  initialized: boolean;
  daysPerWeek: number;
  hourlyRateHistory: HourlyRateEntry[];
  simpleTemplates: ServiceTemplate[]; // Renamed from services for clarity
  complexTemplates: ComplexProjectTemplate[]; 
  projectTemplates?: any[]; // Legacy cleanup
}

export interface Project {
  id: string;
  number: number;
  name: string;
  client: string;
  estimatedHours: number; // Fixed at 0 for new projects
  fixedPrice: number; // Valor fechado do trabalho
  hourlyRate: number; // Rate snapshot at time of creation (CRITICAL)
  notes: string;
  status: ProjectStatus;
  timeSpentSeconds: number;
  totalCost: number; // Sum of (timeSpent * hourlyRate) + extraCosts
  createdAt: number;
  startDate: number; // Project start date timestamp
  completedAt?: number;
  pomodoroTimeLeft?: number; // Persists the current session's remaining time
  isTimerRunning?: boolean; // Track if the pomodoro is active for this project
  
  // Additive fields for Complex Projects
  type?: 'simple' | 'complex';
  deliverables?: Deliverable[];
  extraCosts?: ExtraCost[];
  activeDeliverableId?: string | null; // Track which subtask is being edited
}

export type View = 'login' | 'signup' | 'welcome' | 'onboarding' | 'dashboard' | 'create-project' | 'project-detail' | 'report' | 'monthly-report';