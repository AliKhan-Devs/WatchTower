'use client';
import { useState } from 'react';
import api from '@/lib/api';

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
      setThreshold(''); setWebhookUrl(''); setEmail('');
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Create Alert</h3>
      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Alert Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="ERROR_RATE">Error Rate (%)</option>
            <option value="RESPONSE_TIME">Response Time (ms)</option>
            <option value="UPTIME">Uptime (Down alert)</option>
          </select>
        </div>
        {type !== 'UPTIME' && (
          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Threshold ({type === 'ERROR_RATE' ? '%' : 'ms'})
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={type === 'ERROR_RATE' ? 'e.g. 5' : 'e.g. 2000'}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        )}
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Webhook URL (Slack/Discord)</label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ali@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Cooldown (minutes)</label>
          <input
            type="number"
            value={cooldown}
            onChange={(e) => setCooldown(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-semibold transition"
        >
          {loading ? 'Creating...' : 'Create Alert'}
        </button>
      </div>
    </div>
  );
};