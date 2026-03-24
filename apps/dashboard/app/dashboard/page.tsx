'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

type AppSummary = {
  id: string;
  name: string;
  description?: string | null;
  apiKey: string;
  _count?: {
    metrics?: number;
  };
};

export default function DashboardPage() {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/api/apps')
      .then((res) => setApps(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const createApp = async () => {
    if (!newAppName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/api/apps', { name: newAppName });
      setApps((prev) => [res.data, ...prev]);
      setNewAppName('');
    } catch {}
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-8">
      <section className="surface-panel grid-glow overflow-hidden rounded-[1.8rem] p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="status-pill inline-flex items-center px-3 py-1 text-xs font-medium">Workspace Overview</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A calmer view of every monitored application.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
              Create apps, inspect live telemetry, and jump into detailed performance trends without changing your workflow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-2xl font-semibold text-white">{loading ? '-' : apps.length}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Apps</p>
            </div>
            <div className="surface-muted rounded-2xl p-4">
              <p className="text-2xl font-semibold text-white">{loading ? '-' : apps.reduce((sum, app) => sum + (app._count?.metrics ?? 0), 0)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Metrics</p>
            </div>
            <div className="surface-muted col-span-2 rounded-2xl p-4 sm:col-span-1">
              <p className="text-2xl font-semibold text-emerald-300">{loading ? '-' : apps.length > 0 ? 'Live' : 'Ready'}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-[1.6rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Create a new app</h3>
            <p className="mt-1 text-sm text-slate-400">Add a monitored application to start collecting metrics and alerts.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createApp()}
              placeholder="New app name..."
              className="field-input flex-1 px-4 py-3 text-sm"
            />
            <button
              onClick={createApp}
              disabled={creating}
              className="button-primary px-5 py-3 text-sm font-semibold whitespace-nowrap"
            >
              {creating ? 'Creating...' : 'Add App'}
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Applications</h3>
          <p className="text-sm text-slate-400">All your monitored services in one place.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface-panel rounded-[1.4rem] p-6">
                <div className="h-4 w-24 rounded bg-white/8" />
                <div className="mt-4 h-3 w-36 rounded bg-white/6" />
                <div className="mt-8 h-3 w-44 rounded bg-white/6" />
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="surface-panel rounded-[1.6rem] px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/6 text-xl font-semibold text-white">
              WT
            </div>
            <p className="mt-6 text-xl font-semibold text-white">No apps yet</p>
            <p className="mt-2 text-sm text-slate-400">Create your first app above to start monitoring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="block">
                <div className="surface-panel grid-glow h-full rounded-[1.5rem] p-6 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-slate-900/90">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{app.name}</h4>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">App Detail</p>
                    </div>
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.65)]"></span>
                  </div>
                  {app.description && <p className="mb-5 text-sm leading-6 text-slate-400">{app.description}</p>}
                  <div className="space-y-3">
                    <div className="surface-muted rounded-2xl p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">API Key</p>
                      <p className="mt-2 truncate font-mono text-xs text-slate-300">{app.apiKey}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Recorded metrics</span>
                      <span className="font-semibold text-white">{app._count?.metrics ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
