'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

type WorkspaceApp = {
  id: string;
  name: string;
};

type Workspace = {
  name: string;
  apps?: WorkspaceApp[];
};

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [apps, setApps] = useState<WorkspaceApp[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    api.get('/api/workspace').then((res) => {
      setWorkspace(res.data);
      setApps(res.data.apps || []);
    }).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.clear();
    disconnectSocket();
    router.push('/login');
  };

  return (
    <aside className="surface-panel-strong fixed left-0 top-0 z-40 flex h-[72px] w-full items-center border-b px-4 lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:border-b-0 lg:border-r lg:px-0">
      <div className="flex min-w-0 flex-1 items-center justify-between lg:block lg:flex-none lg:border-b lg:border-white/8 lg:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.18)]">
            WT
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-white">WatchTower</h1>
            {workspace && <p className="truncate text-xs text-slate-400">{workspace.name}</p>}
          </div>
        </div>
        <button
          onClick={logout}
          className="button-secondary hidden px-3 py-2 text-sm lg:hidden"
        >
          Logout
        </button>
      </div>

      <nav className="hidden flex-1 overflow-y-auto p-4 lg:block">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Workspace
        </p>
        <Link
          href="/dashboard"
          className={`mb-2 flex items-center gap-2 rounded-2xl px-3 py-3 text-sm ${
            pathname === '/dashboard'
              ? 'bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(37,99,235,0.28))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
              : 'text-slate-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          Overview
        </Link>

        {apps.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Your Apps</p>
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                className={`mb-1 flex items-center gap-2 truncate rounded-2xl px-3 py-3 text-sm transition ${
                  pathname === `/dashboard/apps/${app.id}`
                    ? 'bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(37,99,235,0.28))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                {app.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="hidden p-4 lg:block lg:border-t lg:border-white/8">
        <button
          onClick={logout}
          className="button-secondary w-full px-3 py-3 text-left text-sm"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};
