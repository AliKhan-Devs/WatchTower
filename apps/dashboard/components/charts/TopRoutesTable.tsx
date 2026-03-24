'use client';

interface Props {
  data: { route: string; count: number; avgResponseTime: number; errorRate: number }[];
}

export const TopRoutesTable = ({ data }: Props) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <h3 className="text-white font-semibold mb-4">Top Routes</h3>
    {data.length === 0 ? (
      <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left pb-2">Route</th>
              <th className="text-right pb-2">Requests</th>
              <th className="text-right pb-2">Avg (ms)</th>
              <th className="text-right pb-2">Error %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2 text-gray-300 font-mono text-xs">{row.route}</td>
                <td className="py-2 text-right text-gray-300">{row.count}</td>
                <td className="py-2 text-right text-blue-400">{row.avgResponseTime}ms</td>
                <td className={`py-2 text-right font-semibold ${row.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
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