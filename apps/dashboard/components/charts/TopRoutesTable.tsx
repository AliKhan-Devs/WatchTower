'use client';

interface Props {
  data: { route: string; count: number; avgResponseTime: number; errorRate: number }[];
}

export const TopRoutesTable = ({ data }: Props) => (
  <div className="surface-panel rounded-[1.4rem] p-6">
    <h3 className="mb-4 text-lg font-semibold text-white">Top Routes</h3>
    {data.length === 0 ? (
      <p className="py-8 text-center text-sm text-slate-500">No data yet</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-slate-400">
              <th className="pb-2 text-left">Route</th>
              <th className="pb-2 text-right">Requests</th>
              <th className="pb-2 text-right">Avg (ms)</th>
              <th className="pb-2 text-right">Error %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-white/6 hover:bg-white/3">
                <td className="py-3 pr-3 font-mono text-xs text-slate-300">{row.route}</td>
                <td className="py-3 text-right text-slate-300">{row.count}</td>
                <td className="py-3 text-right text-sky-300">{row.avgResponseTime}ms</td>
                <td className={`py-3 text-right font-semibold ${row.errorRate > 5 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {row.errorRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
