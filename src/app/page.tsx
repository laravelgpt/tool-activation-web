'use client';

import { useAuth } from '@/contexts/auth-context';
import { AuthForm } from '@/components/auth/login-form';
import { UserDashboard } from '@/components/dashboard/user-dashboard';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { EnhancedLandingPage } from '@/components/landing/enhanced-landing-page';
import { AnimatedPageWrapper } from '@/components/ui/animated-page-wrapper';

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show enhanced landing page for non-authenticated users
  if (!user) {
    return (
      <AnimatedPageWrapper>
        <EnhancedLandingPage />
      </AnimatedPageWrapper>
    );
  }

  // Show admin dashboard for admin users, user dashboard for others
  if (user.role === 'ADMIN') {
    return (
      <AnimatedPageWrapper>
        <AdminDashboard />
      </AnimatedPageWrapper>
    );
  }

  return (
    <AnimatedPageWrapper>
      <UserDashboard />
    </AnimatedPageWrapper>
  );
}