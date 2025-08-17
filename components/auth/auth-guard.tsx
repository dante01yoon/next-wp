'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './login-form';
import { getAuthInstance, type AuthState } from '@/lib/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  showLoginForm?: boolean;
}

export function AuthGuard({ 
  children, 
  fallback, 
  requireAuth = false,
  showLoginForm = true 
}: AuthGuardProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const authInstance = getAuthInstance();
    
    // Get initial state
    setAuthState(authInstance.getAuthState());
    
    // Subscribe to auth changes
    const unsubscribe = authInstance.subscribe(setAuthState);
    
    return unsubscribe;
  }, []);

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !authState.isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showLoginForm) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoginForm 
            title="Authentication Required"
            description="Please sign in to access this content"
          />
        </div>
      );
    }
    
    return null;
  }

  // Authentication not required or user is authenticated
  return <>{children}</>;
}

// Convenience component for protecting routes
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}

// Component to show content only to authenticated users
export function AuthenticatedOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} fallback={fallback} showLoginForm={false}>
      {children}
    </AuthGuard>
  );
}

// Component to show content only to unauthenticated users
export function UnauthenticatedOnly({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const authInstance = getAuthInstance();
    setAuthState(authInstance.getAuthState());
    const unsubscribe = authInstance.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  if (authState.isLoading) {
    return null;
  }

  if (authState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
