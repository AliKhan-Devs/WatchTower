'use client';
import { useState, useEffect } from 'react';
import api from '../api';

export const useMetrics = (appId: string | null, hours: number = 24) => {
  const [overview, setOverview] = useState<any>(null);
  const [responseTimeChart, setResponseTimeChart] = useState<any[]>([]);
  const [errorRateChart, setErrorRateChart] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const [ov, rt, er, tr] = await Promise.all([
        api.get(`/api/metrics/${appId}/overview?hours=${hours}`),
        api.get(`/api/metrics/${appId}/response-time?hours=${hours}`),
        api.get(`/api/metrics/${appId}/error-rate?hours=${hours}`),
        api.get(`/api/metrics/${appId}/top-routes?hours=${hours}`)
      ]);
      setOverview(ov.data);
      setResponseTimeChart(rt.data);
      setErrorRateChart(er.data);
      setTopRoutes(tr.data);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [appId, hours]);

  return { overview, responseTimeChart, errorRateChart, topRoutes, loading, refetch: fetch };
};