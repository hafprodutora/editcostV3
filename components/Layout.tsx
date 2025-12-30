import React from 'react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, Coins, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: any) => void;
  currentView: string;
  userEmail?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView, userEmail }) => {
  const isAuth = currentView !== 'login' && currentView !== 'signup';
  
  const userPrefix = userEmail ? userEmail.split('@')[0] : '';

  return (
    <div className="min-h-screen flex flex-col">
      {isAuth && (
        <nav className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div 
                  className="flex-shrink-0 flex items-center cursor-pointer gap-2" 
                  onClick={() => onNavigate('dashboard')}
                >
                  <Coins className="text-indigo-600" size={28} />
                  <div>
                    <span className="text-2xl font-bold text-indigo-600">Edit</span>
                    <span className="text-2xl font-bold text-gray-900">Cost</span>
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`${
                      currentView === 'dashboard'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('create-project')}
                    className={`${
                      currentView === 'create-project'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Novo Projeto
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 {userPrefix && (
                   <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 mr-2">
                     <User size={14} className="text-gray-400" />
                     <span className="text-sm font-semibold text-gray-600">{userPrefix}</span>
                   </div>
                 )}
                 <button
                    onClick={() => onNavigate('onboarding')}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    title="Configurações"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    onClick={() => onNavigate('logout')}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                    title="Sair"
                  >
                    <LogOut size={20} />
                  </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-xs">
          © 2024 EditCost - Ferramenta de Produtividade para Editores
        </div>
      </footer>
    </div>
  );
};

export default Layout;