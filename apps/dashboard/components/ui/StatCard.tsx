'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

const colorMap = {
  green: 'text-green-400',
  red: 'text-red-400',
  blue: 'text-blue-400',
  yellow: 'text-yellow-400'
};

export const StatCard = ({ title, value, subtitle, color = 'blue' }: StatCardProps) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <p className="text-gray-400 text-sm mb-1">{title}</p>
    <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
  </div>
);