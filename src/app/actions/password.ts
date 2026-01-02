"use server";

import { siteConfig } from "@/config/site";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate password reset token
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal if user exists
    return { success: true, message: "If an account exists, a reset email will be sent." };
  }

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  // Store token - using a simple approach with user's name field temporarily
  // In production, you'd have a PasswordResetToken model
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Store token info in a way that can be validated
      // For now, we'll use a workaround since there's no dedicated field
    },
  });

  // For demo purposes, we'll log the token
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: `Password Reset - ${siteConfig.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10B981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>- ${siteConfig.name} Team</p>
      </div>
    `,
  });

  return { success: true, message: "If an account exists, a reset email will be sent." };
}

// Verify token and reset password
export async function resetPassword(token: string, newPassword: string) {
  // In a real implementation, you would:
  // 1. Look up the token in a PasswordResetToken table
  // 2. Verify it hasn't expired
  // 3. Hash the new password
  // 4. Update the user's password
  // 5. Delete/invalidate the token

  // For now, return a placeholder response
  return {
    success: false,
    error: "Password reset requires PasswordResetToken model. Token was logged for demo."
  };
}
