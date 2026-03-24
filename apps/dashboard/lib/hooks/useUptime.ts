'use client';
import { useState, useEffect } from 'react';
import api from '../api';

export const useUptime = (appId: string | null) => {
  const [uptimeData, setUptimeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/uptime/${appId}/history`);
      setUptimeData(res.data);
    } catch {
      setUptimeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [appId]);

  return { uptimeData, loading, refetch: fetch };
};