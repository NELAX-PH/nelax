'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function softDeleteAccount(userId: string, userEmail: string) {
  try {
    // Generate a unique deleted email
    const timestamp = Date.now();
    const deletedEmail = `deleted_${userId}_${String(timestamp).slice(-8)}@deleted.local`;

    // Update the user account in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: deletedEmail,
      user_metadata: {
        account_status: 'deleted',
        deleted_at: new Date().toISOString(),
        original_email: userEmail,
      },
    });

    if (authError) {
      console.error('Error updating user auth:', authError);
      return { success: false, error: authError.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    revalidatePath('/login');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message || 'Failed to delete account' };
  }
}
