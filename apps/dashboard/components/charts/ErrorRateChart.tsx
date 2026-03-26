'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: { time: string; errorRate: number; total: number }[];
}

export const ErrorRateChart = ({ data }: Props) => {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="surface-panel rounded-[1.4rem] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Error Rate (%)</h3>
      {formatted.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#08111f', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: 16 }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value) => {
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${numericValue.toFixed(2)}%`, 'Error Rate'];
              }}
            />
            <Bar dataKey="errorRate" fill="#fb7185" radius={[8, 8, 0, 0]} name="Error Rate" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
