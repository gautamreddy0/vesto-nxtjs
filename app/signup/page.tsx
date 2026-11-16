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

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name || name.trim().length === 0) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } }
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: name.trim(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch {
          // Non-fatal — account page will create the profile if needed
        }

        router.push('/account');
        router.refresh();
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    value: string,
    onChange: (v: string) => void,
    error?: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground font-medium">{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); if (error) setErrors((prev) => ({ ...prev, [id]: undefined })); }}
        className={error ? 'border-red-500' : ''}
        disabled={loading}
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_20px_80px_rgba(1,29,60,0.12)] lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between bg-brand-hero p-8 text-white md:p-10">
          <BrandLogo variant="full" tone="dark" className="h-14 w-auto" />
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="eyebrow text-white/70">Learn • Analyze • Simulate • Invest Smarter</div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Build a sharper investment process.</h1>
            </div>
            <ul className="space-y-3 text-sm text-white/80 md:text-base">
              <li>• Practice financial analysis on real companies</li>
              <li>• Review AI feedback before taking a position</li>
              <li>• Grow confidence with a disciplined paper-trading workflow</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center p-6 md:p-8">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">Create account</CardTitle>
              <CardDescription>
                Enter your information to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {errors.general}
                  </div>
                )}

                {field('name', 'Full Name', 'text', 'Jane Smith', name, setName, errors.name)}
                {field('email', 'Email', 'email', 'you@example.com', email, setEmail, errors.email)}
                {field('password', 'Password', 'password', 'At least 6 characters', password, setPassword, errors.password)}
                {field('confirmPassword', 'Confirm Password', 'password', 'Re-enter your password', confirmPassword, setConfirmPassword, errors.confirmPassword)}

                <Button
                  type="submit"
                  className="mt-2 w-full border border-primary-border bg-primary text-primary-foreground hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>

                <p className="pt-1 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-primary-text hover:underline">
                    Login
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
