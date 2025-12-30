
import React, { useState, useEffect } from 'react';
import { Coins, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

interface SignupProps {
  onSignup: (email: string, password: string) => void;
  onBackToLogin: () => void;
  externalError?: string | null;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onBackToLogin, externalError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalError) {
      setError(externalError);
    } else {
      setError(null);
    }
  }, [externalError]);

  // Auto-dismiss internal error state
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email.length < 5 || !email.includes('@')) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    onSignup(email, password);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mt-12">
      <button 
        onClick={onBackToLogin}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Voltar para o login
      </button>

      <div className="flex justify-center mb-8">
        <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-2">
          <Coins className="text-indigo-600" size={32} />
          <span className="text-2xl font-bold text-gray-900 tracking-tight">EditCost</span>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
        <p className="text-gray-500 mt-1">Comece a gerenciar seus projetos gratuitamente</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha forte"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-4"
        >
          Criar conta
        </button>
      </form>
    </div>
  );
};

export default Signup;
