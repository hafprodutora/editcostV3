import React from 'react';
import { Coins } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="max-w-lg mx-auto bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-indigo-50 p-4 rounded-2xl">
          <Coins className="text-indigo-600" size={48} />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao EditCost</h1>
      <p className="text-gray-500 mb-10 leading-relaxed">
        Sua nova plataforma para gestão de tempo e custos de edição. Antes de começar seus projetos, precisamos definir suas configurações base de custo.
      </p>
      <button
        onClick={onStart}
        className="w-full bg-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
      >
        Ajustar custos
      </button>
    </div>
  );
};

export default Welcome;