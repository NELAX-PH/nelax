import { Resend } from 'resend';

export interface EmailTemplate {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail = async (
  emailData: EmailTemplate
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Nelax Systems <noreply@nelax.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html || '',
      text: emailData.text || '',
    });

    return { success: !!result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Email template functions
export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    to: name,
    subject: 'Welcome to Nelax Systems',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Nelax!</h1>
        <p>Hi ${name},</p>
        <p>Welcome to Nelax Systems! We're excited to help you manage your business with our simple POS and inventory management solution.</p>
        <p>Get started by exploring our features and setting up your first store.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Welcome to Nelax! Hi ${name}, welcome to Nelax Systems! Get started by exploring our features. Best regards, The Nelax Team`,
  }),

  passwordReset: (name: string, resetLink: string): EmailTemplate => ({
    to: name,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Reset Your Password</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Reset Your Password. Hi ${name}, we received a request to reset your password. Visit: ${resetLink}. This link expires in 30 minutes.`,
  }),

  verification: (name: string, verificationLink: string): EmailTemplate => ({
    to: name,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email</h1>
        <p>Hi ${name},</p>
        <p>Please verify your email address to activate your account:</p>
        <p><a href="${verificationLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Verify Your Email. Hi ${name}, verify your email address at: ${verificationLink}. If you didn't create an account, please ignore this.`,
  }),

  lowStockAlert: (
    storeName: string,
    productName: string,
    currentStock: number,
    minStock: number
  ): EmailTemplate => ({
    to: storeName,
    subject: 'Low Stock Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Low Stock Alert</h1>
        <p>Attention!</p>
        <p>The following product is running low on stock:</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Current Stock:</strong> ${currentStock}</p>
        <p><strong>Minimum Stock:</strong> ${minStock}</p>
        <p>Please restock soon to avoid running out.</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Low Stock Alert. Product: ${productName}. Current Stock: ${currentStock}. Minimum Stock: ${minStock}. Please restock soon.`,
  }),

  subscriptionExpiring: (name: string, plan: string, expiryDate: string): EmailTemplate => ({
    to: name,
    subject: 'Subscription Expiring Soon',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Subscription Expiring Soon</h1>
        <p>Hi ${name},</p>
        <p>Your ${plan} subscription will expire on ${expiryDate}.</p>
        <p>To continue enjoying all our features, please renew your subscription.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Renew Subscription</a></p>
        <p>Thank you for being a valued customer!</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Subscription Expiring Soon. Hi ${name}, your ${plan} subscription expires on ${expiryDate}. Renew at ${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  }),

  invoice: (name: string, invoiceNumber: string, amount: string): EmailTemplate => ({
    to: name,
    subject: `Invoice #${invoiceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Invoice #${invoiceNumber}</h1>
        <p>Hi ${name},</p>
        <p>Thank you for your payment!</p>
        <p><strong>Amount Paid:</strong> ${amount}</p>
        <p>You can view your invoice details in your dashboard.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Dashboard</a></p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Nelax Team</p>
      </div>
    `,
    text: `Invoice #${invoiceNumber}. Hi ${name}, thank you for your payment! Amount: ${amount}. View details in your dashboard.`,
  }),
};
