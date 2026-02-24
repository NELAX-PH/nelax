'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const upgradeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  paymentMethod: z.enum(['gcash', 'maya', 'bank_transfer']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
});

export async function upgradeToPro(formData: FormData) {
  try {
    const userId = formData.get('userId') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const referenceNumber = formData.get('referenceNumber') as string;

    // Validate input
    const result = upgradeSchema.safeParse({ userId, paymentMethod, referenceNumber });
    if (!result.success) {
      return { success: false, error: result.error.issues[0]?.message || 'Invalid input' };
    }

    // Get current user data
    const {
      data: { user },
      error: getUserError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getUserError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Check if already Pro
    if (user.user_metadata?.plan === 'Pro') {
      return { success: false, error: 'You already have a Pro plan' };
    }

    // Update user plan to Pro
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        plan: 'Pro',
        upgraded_at: new Date().toISOString(),
        payment_method: paymentMethod,
        payment_reference: referenceNumber,
      },
    });

    if (updateError) {
      console.error('Error updating user plan:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/upgrade');

    return { success: true, message: 'Successfully upgraded to Pro plan!' };
  } catch (error: any) {
    console.error('Error upgrading plan:', error);
    return { success: false, error: error.message || 'Failed to upgrade plan' };
  }
}
