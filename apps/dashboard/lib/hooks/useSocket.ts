'use client';
import { useEffect, useRef } from 'react';
import { getSocket } from '../socket';

interface LiveMetric {
  route: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

export const useSocket = (
  appId: string | null,
  onMetrics: (metrics: LiveMetric[]) => void,
  onAlert?: (alert: any) => void,
  onUptime?: (data: any) => void
) => {
  const subscribedApp = useRef<string | null>(null);

  useEffect(() => {
    if (!appId) return;

    const socket = getSocket();

    const handleConnect = () => {
      socket.emit('subscribe:app', appId);
      subscribedApp.current = appId;
    };

    const handleMetrics = (data: { appId: string; metrics: LiveMetric[] }) => {
      if (data.appId === appId) onMetrics(data.metrics);
    };

    const handleAlert = (data: any) => onAlert?.(data);
    const handleUptime = (data: any) => onUptime?.(data);

    if (socket.connected) handleConnect();

    socket.on('connect', handleConnect);
    socket.on('metrics:new', handleMetrics);
    socket.on('alert:fired', handleAlert);
    socket.on('uptime:status', handleUptime);

    return () => {
      if (subscribedApp.current) {
        socket.emit('unsubscribe:app', subscribedApp.current);
      }
      socket.off('connect', handleConnect);
      socket.off('metrics:new', handleMetrics);
      socket.off('alert:fired', handleAlert);
      socket.off('uptime:status', handleUptime);
    };
  }, [appId]);
};