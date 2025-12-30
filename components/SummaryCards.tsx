
import React from 'react';
import { Clock, DollarSign, Edit, CheckCircle } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/formatters';

interface SummaryCardsProps {
  totalSeconds: number;
  totalCost: number;
  inProgress: number;
  completed: number;
  currency: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalSeconds, totalCost, inProgress, completed, currency }) => {
  const cards = [
    {
      title: 'Horas trabalhadas',
      value: formatTime(totalSeconds),
      icon: <Clock className="text-blue-600" size={24} />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Custo total',
      value: formatCurrency(totalCost, currency),
      icon: <DollarSign className="text-green-600" size={24} />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Projetos em edição',
      value: inProgress,
      icon: <Edit className="text-orange-600" size={24} />,
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Projetos concluídos',
      value: completed,
      icon: <CheckCircle className="text-emerald-600" size={24} />,
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`${card.bgColor} p-3 rounded-xl`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
