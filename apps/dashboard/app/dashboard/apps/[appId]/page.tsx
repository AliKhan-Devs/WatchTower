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

export default function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [hours, setHours] = useState(24);
  const [liveCount, setLiveCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);

  const { overview, responseTimeChart, errorRateChart, topRoutes, loading, refetch } =
    useMetrics(appId, hours);

  // Live metrics via WebSocket
  const handleLiveMetrics = useCallback((metrics: any[]) => {
    setLiveCount((c) => c + metrics.length);
    // Refetch charts every 10 live events
    if (liveCount > 0 && liveCount % 10 === 0) refetch();
  }, [liveCount]);

  const handleAlert = useCallback((alert: any) => {
    setNotification(`🚨 Alert fired: ${alert.type} on ${alert.appName}`);
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

  if (!app) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-red-900 border border-red-700 text-white px-4 py-3 rounded-xl text-sm z-50 shadow-lg">
          {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{app.name}</h2>
          <p className="text-gray-500 text-xs font-mono mt-1">API Key: {app.apiKey}</p>
        </div>
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {liveCount} live events
            </span>
          )}
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value={1}>Last 1h</option>
            <option value={24}>Last 24h</option>
            <option value={168}>Last 7d</option>
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Requests" value={overview?.total ?? '—'} color="blue" />
        <StatCard
          title="Avg Response Time"
          value={overview ? `${overview.avgResponseTime}ms` : '—'}
          color={overview?.avgResponseTime > 1000 ? 'red' : 'green'}
        />
        <StatCard
          title="Error Rate"
          value={overview ? `${overview.errorRate}%` : '—'}
          color={overview?.errorRate > 5 ? 'red' : 'green'}
        />
        <StatCard title="Total Errors" value={overview?.errors ?? '—'} color="yellow" />
      </div>

      {/* Uptime */}
      <div className="mb-6">
        <UptimeStatus appId={appId} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ResponseTimeChart data={responseTimeChart} />
        <ErrorRateChart data={errorRateChart} />
      </div>

      {/* Top routes */}
      <div className="mb-6">
        <TopRoutesTable data={topRoutes} />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertForm appId={appId} onCreated={() => {
          api.get(`/api/alerts/${appId}`).then((res) => setAlerts(res.data));
        }} />

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Active Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No alerts configured</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-white text-sm font-semibold">{alert.type}</p>
                    <p className="text-gray-400 text-xs">
                      Threshold: {alert.threshold} · Cooldown: {alert.cooldownMins}m
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className={`text-xs px-2 py-1 rounded ${alert.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}
                    >
                      {alert.isActive ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-xs px-2 py-1 rounded bg-red-900 text-red-300"
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