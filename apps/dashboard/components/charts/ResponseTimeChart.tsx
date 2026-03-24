'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: { time: string; avg: number; min: number; max: number }[];
}

export const ResponseTimeChart = ({ data }: Props) => {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Response Time (ms)</h3>
      {formatted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={false} name="Avg" />
            <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={1} dot={false} name="Max" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="min" stroke="#10b981" strokeWidth={1} dot={false} name="Min" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};