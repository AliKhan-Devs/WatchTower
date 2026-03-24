'use client';
import { useUptime } from '@/lib/hooks/useUptime';

export const UptimeStatus = ({ appId }: { appId: string }) => {
  const { uptimeData, loading } = useUptime(appId);

  if (loading) return <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-400 text-sm">Loading uptime...</div>;
  if (!uptimeData?.check) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-sm">No uptime check configured</p>
    </div>
  );

  const { check, uptimePercent, totalPings, failedPings } = uptimeData;
  const isUp = check.status === 'UP';
  const isDown = check.status === 'DOWN';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">Uptime Monitor</p>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          isUp ? 'bg-green-900 text-green-300' :
          isDown ? 'bg-red-900 text-red-300' :
          'bg-gray-700 text-gray-300'
        }`}>
          {check.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate mb-3">{check.url}</p>
      <div className="flex gap-4">
        <div>
          <p className="text-2xl font-bold text-green-400">{uptimePercent ?? '—'}%</p>
          <p className="text-xs text-gray-500">uptime (24h)</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-400">{failedPings}</p>
          <p className="text-xs text-gray-500">failed pings</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-400">{totalPings}</p>
          <p className="text-xs text-gray-500">total pings</p>
        </div>
      </div>
    </div>
  );
};