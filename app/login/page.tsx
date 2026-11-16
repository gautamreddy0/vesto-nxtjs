'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email!,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        router.push('/dashboard');
        router.refresh();
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_80px_rgba(1,29,60,0.12)] lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between bg-brand-hero p-8 text-white md:p-10">
          <BrandLogo variant="full" tone="dark" className="h-14 w-auto" />
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="eyebrow text-white/70">Learn • Analyze • Simulate • Invest Smarter</div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Practice smarter investing.</h1>
            </div>
            <ul className="space-y-3 text-sm text-white/80 md:text-base">
              <li>• Build conviction with structured financial analysis</li>
              <li>• Test your thesis against an AI Fund Manager</li>
              <li>• Track a $10,000 paper portfolio without the guesswork</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center p-6 md:p-8">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {errors.general}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium text-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    className={errors.password ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full border border-primary-border bg-primary text-primary-foreground hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading ? 'Logging in…' : 'Login'}
                </Button>

                <p className="pt-1 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="font-medium text-primary-text hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
