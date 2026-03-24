'use client';
import { useUptime } from '@/lib/hooks/useUptime';

export const UptimeStatus = ({ appId }: { appId: string }) => {
  const { uptimeData, loading } = useUptime(appId);

  if (loading) return <div className="surface-panel rounded-[1.4rem] p-6 text-sm text-slate-400">Loading uptime...</div>;
  if (!uptimeData?.check) {
    return (
      <div className="surface-panel rounded-[1.4rem] p-6">
        <p className="text-sm text-slate-400">No uptime check configured</p>
      </div>
    );
  }

  const { check, uptimePercent, totalPings, failedPings } = uptimeData;
  const isUp = check.status === 'UP';
  const isDown = check.status === 'DOWN';

  return (
    <div className="surface-panel grid-glow rounded-[1.4rem] p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Uptime Monitor</p>
          <p className="mt-1 truncate text-xs text-slate-500">{check.url}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isUp ? 'bg-emerald-500/12 text-emerald-300' :
          isDown ? 'bg-rose-500/12 text-rose-300' :
          'bg-slate-500/12 text-slate-300'
        }`}>
          {check.status}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-muted rounded-2xl p-4">
          <p className="text-2xl font-semibold text-emerald-300">{uptimePercent ?? '-'}%</p>
          <p className="mt-1 text-xs text-slate-500">uptime (24h)</p>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <p className="text-2xl font-semibold text-rose-300">{failedPings}</p>
          <p className="mt-1 text-xs text-slate-500">failed pings</p>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <p className="text-2xl font-semibold text-sky-300">{totalPings}</p>
          <p className="mt-1 text-xs text-slate-500">total pings</p>
        </div>
      </div>
    </div>
  );
};
