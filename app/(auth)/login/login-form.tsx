'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Label, FormField, Alert } from '@/components/ui';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : signInError.message
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo || '/spaces');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <p className="ml-2 text-sm">{error}</p>
        </Alert>
      )}

      <FormField label="Email address" required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-10"
            required
            autoComplete="email"
          />
        </div>
      </FormField>

      <FormField label="Password" required>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10"
            required
            autoComplete="current-password"
            minLength={6}
          />
        </div>
      </FormField>

      <Button type="submit" className="w-full" loading={loading} disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </Button>
    </form>
  );
}
