'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { time: string; errorRate: number; total: number }[];
}

export const ErrorRateChart = ({ data }: Props) => {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Error Rate (%)</h3>
      {formatted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#f9fafb' }}
              formatter={(val: number) => [`${val.toFixed(2)}%`, 'Error Rate']}
            />
            <Bar dataKey="errorRate" fill="#ef4444" radius={[4, 4, 0, 0]} name="Error Rate" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};