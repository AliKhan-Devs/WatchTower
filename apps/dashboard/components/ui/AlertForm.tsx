'use client';
import { useState } from 'react';
import api from '@/lib/api';

type ApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

interface Props {
  appId: string;
  onCreated: () => void;
}

export const AlertForm = ({ appId, onCreated }: Props) => {
  const [type, setType] = useState<'ERROR_RATE' | 'RESPONSE_TIME' | 'UPTIME'>('ERROR_RATE');
  const [threshold, setThreshold] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState('15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!threshold && type !== 'UPTIME') { setError('Threshold is required'); return; }
    if (!webhookUrl && !email) { setError('Webhook URL or email is required'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/alerts', {
        appId,
        type,
        threshold: parseFloat(threshold) || 0,
        cooldownMins: parseInt(cooldown),
        webhookUrl: webhookUrl || undefined,
        email: email || undefined
      });
      setThreshold('');
      setWebhookUrl('');
      setEmail('');
      onCreated();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-panel rounded-[1.4rem] p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">Create Alert</h3>
        <p className="mt-1 text-sm text-slate-400">Notify your team when key thresholds drift outside expected ranges.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Alert Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'ERROR_RATE' | 'RESPONSE_TIME' | 'UPTIME')}
            className="field-input px-4 py-3 text-sm"
          >
            <option value="ERROR_RATE">Error Rate (%)</option>
            <option value="RESPONSE_TIME">Response Time (ms)</option>
            <option value="UPTIME">Uptime (Down alert)</option>
          </select>
        </div>
        {type !== 'UPTIME' && (
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Threshold ({type === 'ERROR_RATE' ? '%' : 'ms'})
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={type === 'ERROR_RATE' ? 'e.g. 5' : 'e.g. 2000'}
              className="field-input px-4 py-3 text-sm"
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Webhook URL (Slack/Discord)</label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="field-input px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ali@example.com"
            className="field-input px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Cooldown (minutes)</label>
          <input
            type="number"
            value={cooldown}
            onChange={(e) => setCooldown(e.target.value)}
            className="field-input px-4 py-3 text-sm"
          />
        </div>
        {error && <p className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="button-primary w-full px-4 py-3 text-sm font-semibold"
        >
          {loading ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </div>
  );
};
