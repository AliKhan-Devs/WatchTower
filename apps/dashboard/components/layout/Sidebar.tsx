'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { disconnectSocket } from '@/lib/socket';

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);

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
    <aside className="w-60 bg-gray-950 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg">🗼 WatchTower</h1>
        {workspace && <p className="text-gray-500 text-xs mt-1 truncate">{workspace.name}</p>}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition ${
            pathname === '/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Overview
        </Link>

        {apps.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-600 text-xs uppercase tracking-wider px-3 mb-2">Your Apps</p>
            {apps.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition truncate ${
                  pathname === `/dashboard/apps/${app.id}`
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {app.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full text-left text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};