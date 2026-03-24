'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.push('/login');
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen p-6">{children}</main>
    </div>
  );
}