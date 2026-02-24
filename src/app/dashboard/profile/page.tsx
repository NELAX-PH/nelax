'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Store,
  Package,
  BarChart3,
  TrendingUp,
  LogOut,
  User,
  Settings,
  ArrowLeft,
  Mail,
  Lock,
  Save,
  Camera,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const NAV_ITEMS = [
  { label: 'Overview', icon: BarChart3, href: '/dashboard' },
  { label: 'Inventory', icon: Package, href: '/dashboard/inventory' },
  { label: 'Sell', icon: ShoppingCart, href: '/dashboard/sell' },
  { label: 'Sales', icon: TrendingUp, href: '/dashboard/sales' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if account is marked as deleted
      if (user.user_metadata?.account_status === 'deleted') {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setUser(user);
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setLoading(false);
    }
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    });

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        if (
          uploadError.message?.includes('The resource was not found') ||
          uploadError.message?.includes('Bucket not found')
        ) {
          toast.error(
            'Storage bucket not configured. Please ensure the "avatars" bucket exists in Supabase.'
          );
        } else if (
          uploadError.message?.includes('permission') ||
          uploadError.message?.includes('authorization')
        ) {
          toast.error('Permission denied. Check storage policies in Supabase.');
        } else {
          toast.error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
        }
        return;
      }

      console.log('Upload success:', uploadData);

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        toast.error('Failed to get public URL');
        return;
      }

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) {
        console.error('Avatar URL update error:', updateError);
        toast.error(`Failed to save avatar: ${updateError.message}`);
      } else {
        setAvatarUrl(publicUrl);
        toast.success('Avatar updated');
      }
    } catch (error: any) {
      console.error('Avatar upload unexpected error:', error);
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error('Failed to change password');
    } else {
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent/30">
        <div className="animate-pulse flex flex-col items-center">
          <Store className="h-12 w-12 text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const shopName = user?.user_metadata?.shop_name || 'My Sari-Sari Store';
  const plan = user?.user_metadata?.plan || 'Lite';
  const email = user?.email || '';
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-accent/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Store className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-lg truncate">{shopName}</span>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-accent/50 rounded-2xl p-4 mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Current Plan
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">Sari-Sari {plan}</span>
              {plan === 'Lite' && (
                <button
                  onClick={() => router.push('/dashboard/upgrade')}
                  className="text-[10px] bg-secondary text-white px-2 py-1 rounded-md font-bold uppercase"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </button>
            <h1 className="font-bold text-base md:text-xl">My Profile</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="h-20 w-20 md:h-24 md:w-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl md:text-3xl font-black">
                      {initials}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <h2 className="font-bold text-lg md:text-xl">{fullName || 'Store Owner'}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
                {joinedDate && (
                  <p className="text-xs text-muted-foreground mt-1">Member since {joinedDate}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Email Address</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-accent/30">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g., 09171234567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full btn btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="font-bold text-base md:text-lg">Change Password</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Update your login password.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !newPassword}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold hover:bg-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {changingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-accent transition-colors border-b border-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Shop Settings</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center z-20">
        {NAV_ITEMS.map((item, i) => {
          const isSell = item.href === '/dashboard/sell';
          return (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className={`flex-1 flex flex-col items-center gap-1 transition-colors text-muted-foreground ${isSell ? 'py-1' : 'py-3'}`}
            >
              {isSell ? (
                <div className="h-11 w-11 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg shadow-primary/40">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
              ) : (
                <item.icon className="h-5 w-5" />
              )}
              <span className={`text-[10px] font-semibold ${isSell ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
