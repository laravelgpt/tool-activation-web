'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setIsValidToken(true);
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    router.push('/');
  };

  if (!isValidToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-4">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <ResetPasswordForm token={token} onSuccess={handleSuccess} />
    </div>
  );
}