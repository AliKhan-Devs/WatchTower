// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import api from '@/lib/api';

// export default function DashboardPage() {
//   const router = useRouter();
//   const [apps, setApps] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [newAppName, setNewAppName] = useState('');
//   const [creating, setCreating] = useState(false);

//   useEffect(() => {
//     api.get('/api/apps')
//       .then((res) => setApps(res.data))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const createApp = async () => {
//     if (!newAppName.trim()) return;
//     setCreating(true);
//     try {
//       const res = await api.post('/api/apps', { name: newAppName });
//       setApps((prev) => [res.data, ...prev]);
//       setNewAppName('');
//     } catch {}
//     finally { setCreating(false); }
//   };

//   return (
//     <div>
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
//         <p className="text-gray-400">All your monitored applications</p>
//       </div>

//       <div className="flex gap-3 mb-8">
//         <input
//           type="text"
//           value={newAppName}
//           onChange={(e) => setNewAppName(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && createApp()}
//           placeholder="New app name..."
//           className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 w-64"
//         />
//         <button
//           onClick={createApp} disabled={creating}
//           className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
//         >
//           {creating ? 'Creating...' : '+ Add App'}
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-gray-400">Loading...</p>
//       ) : apps.length === 0 ? (
//         <div className="text-center py-20 text-gray-500">
//           <p className="text-4xl mb-4">📡</p>
//           <p className="text-lg font-semibold text-gray-400 mb-2">No apps yet</p>
//           <p className="text-sm">Create your first app above to start monitoring</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {apps.map((app) => (
//             <Link key={app.id} href={`/dashboard/apps/${app.id}`}>
//               <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 transition cursor-pointer">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-white font-semibold">{app.name}</h3>
//                   <span className="w-2 h-2 rounded-full bg-green-400"></span>
//                 </div>
//                 {app.description && <p className="text-gray-500 text-sm mb-3">{app.description}</p>}
//                 <p className="text-gray-600 text-xs font-mono truncate">{app.apiKey}</p>
//                 <p className="text-gray-500 text-xs mt-2">{app._count?.metrics ?? 0} metrics recorded</p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}