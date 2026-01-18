'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { DragDropProvider } from '@/lib/DragDropContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Pages that should not have sidebar
  const isPublicPage = pathname === '/' || pathname === '/login';

  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [user, loading, pathname, router, isPublicPage]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </motion.div>
      </div>
    );
  }

  // Don't show sidebar on public pages
  if (isPublicPage) {
    return <>{children}</>;
  }

  // User not authenticated
  if (!user) {
    return <>{children}</>;
  }

  return (
    <DragDropProvider>
      <div className="min-h-screen bg-cream-50 flex">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <motion.main
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </DragDropProvider>
  );
}
