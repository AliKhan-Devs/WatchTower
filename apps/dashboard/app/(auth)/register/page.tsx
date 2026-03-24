'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

type ApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_24%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55 shadow-[0_40px_100px_rgba(2,6,23,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden border-r border-white/8 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="status-pill inline-flex items-center px-3 py-1 text-xs font-medium">Team Monitoring</div>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-white">
              Build a sharper operational view for every service you own.
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-400">
              Set up your workspace, invite teammates later, and start tracking performance signals from the first request.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="surface-muted rounded-[1.4rem] p-5">
              <p className="text-sm text-slate-300">Professional monitoring UX with real-time charts, uptime insight, and threshold-based alerts.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-left">
              <div className="surface-muted rounded-2xl p-4">
                <p className="text-2xl font-semibold text-white">Apps</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Overview</p>
              </div>
              <div className="surface-muted rounded-2xl p-4">
                <p className="text-2xl font-semibold text-white">Charts</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Insights</p>
              </div>
              <div className="surface-muted rounded-2xl p-4">
                <p className="text-2xl font-semibold text-white">Alerts</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">Response</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-sm font-semibold text-white">
              WT
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white">Create account</h2>
            <p className="mt-2 text-sm text-slate-400">Start with a new workspace and jump straight into your dashboard.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input px-4 py-3.5 text-white"
                placeholder="Ali Khan"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input px-4 py-3.5 text-white"
                placeholder="ali@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input px-4 py-3.5 text-white"
                placeholder="Choose a password"
              />
            </div>
            {error && <p className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="button-primary w-full px-4 py-3.5 font-semibold"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-sky-300 hover:text-sky-200">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
