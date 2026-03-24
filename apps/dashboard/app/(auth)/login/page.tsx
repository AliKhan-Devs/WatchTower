'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🗼 WatchTower</h1>
          <p className="text-gray-400">Sign in to your dashboard</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="ali@example.com"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleLogin} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-3 font-semibold transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-gray-500 text-sm">
            No account?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}