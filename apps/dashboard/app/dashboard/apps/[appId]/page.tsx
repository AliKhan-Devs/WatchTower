'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useMetrics } from '@/lib/hooks/useMetrics';
import { useSocket } from '@/lib/hooks/useSocket';
import { StatCard } from '@/components/ui/StatCard';
import { UptimeStatus } from '@/components/ui/UptimeStatus';
import { ResponseTimeChart } from '@/components/charts/ResponseTimeChart';
import { ErrorRateChart } from '@/components/charts/ErrorRateChart';
import { TopRoutesTable } from '@/components/charts/TopRoutesTable';
import { AlertForm } from '@/components/ui/AlertForm';

type AppDetail = {
  id: string;
  name: string;
  apiKey: string;
};

type AlertRule = {
  id: string;
  type: string;
  threshold: number;
  cooldownMins: number;
  isActive: boolean;
};

type LiveMetric = Record<string, unknown>;

type SocketAlert = {
  type: string;
  appName: string;
};

export default function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [hours, setHours] = useState(24);
  const [liveCount, setLiveCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const { overview, responseTimeChart, errorRateChart, topRoutes, refetch } =
    useMetrics(appId, hours);

  const handleLiveMetrics = useCallback((metrics: LiveMetric[]) => {
    setLiveCount((current) => {
      const next = current + metrics.length;
      if (next > 0 && next % 10 === 0) refetch();
      return next;
    });
  }, [refetch]);

  const handleAlert = useCallback((alert: SocketAlert) => {
    setNotification(`Alert fired: ${alert.type} on ${alert.appName}`);
    setTimeout(() => setNotification(null), 5000);
  }, []);

  useSocket(appId, handleLiveMetrics, handleAlert);

  useEffect(() => {
    api.get(`/api/apps/${appId}`).then((res) => setApp(res.data)).catch(() => {});
    api.get(`/api/alerts/${appId}`).then((res) => setAlerts(res.data)).catch(() => {});
  }, [appId]);

  const deleteAlert = async (alertId: string) => {
    await api.delete(`/api/alerts/${alertId}`);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    await api.patch(`/api/alerts/${alertId}`, { isActive: !isActive });
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, isActive: !isActive } : a));
  };

  if (!app) return <div className="surface-panel rounded-[1.4rem] p-6 text-sm text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      {notification && (
        <div className="surface-panel-strong fixed right-4 top-4 z-50 rounded-2xl border-rose-400/20 px-4 py-3 text-sm text-white shadow-[0_24px_60px_rgba(136,19,55,0.25)]">
          {notification}
        </div>
      )}

      <section className="surface-panel grid-glow rounded-[1.8rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="status-pill inline-flex items-center px-3 py-1 text-xs font-medium">Application Detail</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{app.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Review request volume, response time, error rate, uptime health, and alerting configuration for this service.
            </p>
            <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-xs text-slate-400">
              <span className="text-slate-500">API Key</span>
              <span className="truncate font-mono text-slate-300">{app.apiKey}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {liveCount > 0 && (
              <span className="status-pill flex items-center justify-center gap-2 px-4 py-3 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {liveCount} live events
              </span>
            )}
            <select
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="field-input min-w-[150px] px-4 py-3 text-sm"
            >
              <option value={1}>Last 1h</option>
              <option value={24}>Last 24h</option>
              <option value={168}>Last 7d</option>
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="Total Requests" value={overview?.total ?? '-'} color="blue" />
        <StatCard
          title="Avg Response Time"
          value={overview ? `${overview.avgResponseTime}ms` : '-'}
          color={overview?.avgResponseTime > 1000 ? 'red' : 'green'}
        />
        <StatCard
          title="Error Rate"
          value={overview ? `${overview.errorRate}%` : '-'}
          color={overview?.errorRate > 5 ? 'red' : 'green'}
        />
        <StatCard title="Total Errors" value={overview?.errors ?? '-'} color="yellow" />
      </div>

      <UptimeStatus appId={appId} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ResponseTimeChart data={responseTimeChart} />
        <ErrorRateChart data={errorRateChart} />
      </div>

      <TopRoutesTable data={topRoutes} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AlertForm
          appId={appId}
          onCreated={() => {
            api.get(`/api/alerts/${appId}`).then((res) => setAlerts(res.data));
          }}
        />

        <div className="surface-panel rounded-[1.4rem] p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <p className="mt-1 text-sm text-slate-400">Review thresholds and quickly enable, pause, or remove existing alert rules.</p>
          </div>
          {alerts.length === 0 ? (
            <div className="surface-muted rounded-[1.25rem] px-4 py-8 text-center text-sm text-slate-400">
              No alerts configured
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="surface-muted flex flex-col gap-4 rounded-[1.25rem] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{alert.type}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Threshold: {alert.threshold} | Cooldown: {alert.cooldownMins}m
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold ${alert.isActive ? 'bg-emerald-500/12 text-emerald-300' : 'bg-slate-500/12 text-slate-300'}`}
                    >
                      {alert.isActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="rounded-xl bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
