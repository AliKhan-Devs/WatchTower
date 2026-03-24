'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'green' | 'red' | 'blue' | 'yellow';
}

const colorMap = {
  green: 'text-emerald-300',
  red: 'text-rose-300',
  blue: 'text-sky-300',
  yellow: 'text-amber-300'
};

export const StatCard = ({ title, value, subtitle, color = 'blue' }: StatCardProps) => (
  <div className="surface-panel grid-glow rounded-[1.4rem] p-5">
    <p className="mb-2 text-sm text-slate-400">{title}</p>
    <p className={`text-3xl font-semibold tracking-tight ${colorMap[color]}`}>{value}</p>
    {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
  </div>
);
