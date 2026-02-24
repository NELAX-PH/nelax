'use client';

import Link from 'next/link';
import { Store, CheckCircle2, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect, Suspense } from 'react';

// Security: Strict validation for registration
const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  plan: z.enum(['Lite', 'Pro']),
});

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState<'Lite' | 'Pro'>('Lite');
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

  useEffect(() => {
    const p = searchParams.get('plan');
    if (p === 'Pro' || p === 'Lite') {
      setPlan(p as 'Lite' | 'Pro');
    }

    const ph = searchParams.get('phone');
    if (ph) {
      let cleaned = ph.replace(/\D/g, '').substring(0, 11);
      if (cleaned.length === 11) {
        cleaned = cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
      }
      setPhone(cleaned);
    }
  }, [searchParams]);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let cleaned = val.replace(/\D/g, '').substring(0, 11);
    if (cleaned.length === 11) {
      cleaned = cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    setPhone(cleaned);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value.replace(/[0-9]/g, ''));
  };

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = signupSchema.safeParse({ fullName, shopName, email, phone, password, plan });
    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || 'Please check your inputs and try again.';
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    try {
      const cleanPhone = phone.replace(/\s/g, '');

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            shop_name: shopName.trim(),
            phone: cleanPhone,
            plan: plan,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        toast.success(
          'Account created! Please check your email for verification (if enabled) and log in.'
        );
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setPlan('Lite')}
          className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all text-center ${plan === 'Lite' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-100 text-muted-foreground'}`}
        >
          Lite (Free)
        </button>
        <button
          type="button"
          onClick={() => setPlan('Pro')}
          className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all text-center ${plan === 'Pro' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-gray-100 text-muted-foreground'}`}
        >
          Pro (₱149)
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={handleNameChange}
          placeholder="Juan Dela Cruz"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Shop Name</label>
        <input
          type="text"
          required
          value={shopName}
          onChange={e => setShopName(e.target.value)}
          placeholder="Dela Cruz Sari-Sari Store"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="juan@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="0900 000 0000"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {password && (
          <div className="mt-2">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i <= getPasswordStrength(password)
                      ? getPasswordStrength(password) <= 2
                        ? 'bg-red-500'
                        : getPasswordStrength(password) <= 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Min. 8 chars</span>
              <span>•</span>
              <span>1 uppercase</span>
              <span>•</span>
              <span>1 number</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          disabled={loading}
          className="btn btn-primary w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-accent/30 flex flex-col items-center py-12 px-4">
      <Link href="/" className="flex items-center gap-2 mb-12 group">
        <Store className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold tracking-tight">Nelax Systems</span>
      </Link>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 md:p-12 lg:bg-primary lg:text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6">Start your journey today.</h1>
            <p className="text-lg mb-10 text-muted-foreground lg:text-primary-foreground/80">
              Join hundreds of shop owners who are saving time and making more money.
            </p>

            <ul className="space-y-6">
              {[
                { title: 'No credit card needed', icon: ShieldCheck },
                { title: 'Instant setup', icon: Zap },
                { title: 'Philippine-made for Filipinos', icon: CheckCircle2 },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 lg:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary lg:text-white" />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl hidden lg:block"></div>
        </div>

        <div className="p-8 md:p-12">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <SignupForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline transition-colors"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
