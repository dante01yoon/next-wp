'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock } from 'lucide-react';
import { loginUser, type AuthCredentials } from '@/lib/auth-context';

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showDemoCredentials?: boolean;
}

export function LoginForm({
  onSuccess,
  onCancel,
  title = 'Sign In',
  description = 'Enter your credentials to access your account',
  showDemoCredentials = true
}: LoginFormProps) {
  const [credentials, setCredentials] = useState<AuthCredentials>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUser(credentials);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      username: 'demo',
      password: 'demo123'
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="pl-9"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || !credentials.username || !credentials.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
          
          {showDemoCredentials && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Demo credentials:</p>
              <div className="flex justify-between items-center">
                <div className="text-xs">
                  <div>Username: demo</div>
                  <div>Password: demo123</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  Use Demo
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
