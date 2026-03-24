'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar />
      <main className="min-h-screen pl-0 lg:pl-72">
        <div className="mx-auto max-w-7xl p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
