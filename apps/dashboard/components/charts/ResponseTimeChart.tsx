'use client';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  data: { time: string; avg: number; min: number; max: number }[];
}

export const ResponseTimeChart = ({ data }: Props) => {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="surface-panel rounded-[1.4rem] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Response Time (ms)</h3>
      {formatted.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#08111f', border: '1px solid rgba(148, 163, 184, 0.16)', borderRadius: 16 }}
              labelStyle={{ color: '#f8fafc' }}
            />
            <Legend />
            <Line type="monotone" dataKey="avg" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Avg" />
            <Line type="monotone" dataKey="max" stroke="#fb7185" strokeWidth={1.5} dot={false} name="Max" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="min" stroke="#34d399" strokeWidth={1.5} dot={false} name="Min" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
