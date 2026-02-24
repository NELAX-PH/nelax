'use client';

import Link from 'next/link';
import { Store, ArrowLeft, Loader2 } from 'lucide-react';
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';

// Security: Define validation schema
const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    }
    checkUser();
  }, [router]);

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/[^a-zA-Z0-9@.]/g, '');

    if (/^\d{11}$/.test(cleaned)) {
      cleaned = cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    setIdentifier(cleaned);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = loginSchema.safeParse({ identifier, password });
    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || 'Email or phone and password are required.';
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const cleanId = identifier.replace(/\s/g, '');
      const isEmail = cleanId.includes('@');

      const credentials = isEmail ? { email: cleanId, password } : { phone: cleanId, password };

      const { data, error: authError } = await supabase.auth.signInWithPassword(credentials);

      if (authError) {
        toast.error('Invalid login credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Welcome back! Logging you in...');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error('A system error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <Store className="h-16 w-16 mb-8" />
          <h1 className="text-5xl font-bold mb-6 text-balance">Welcome back to Nelax Systems.</h1>
          <p className="text-xl text-primary-foreground/90">
            Log in to manage your inventory, record sales, and view your profits for today.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-12 group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>

          <div className="mb-10 md:hidden">
            <Store className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-3xl font-bold">Welcome back to Nelax</h2>
          </div>

          <h2 className="hidden md:block text-3xl font-bold mb-10">Account Login</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={handleIdentifierChange}
                placeholder="0917 000 0000"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-foreground/80">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 font-bold text-lg rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Log In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/get-started"
              className="text-primary font-bold hover:underline transition-colors"
            >
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
