import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResultCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      <p className="text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
}

export default ResultCard;