"use server";

import { siteConfig } from "@/config/site";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Generate password reset token and send email
 */
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: "If an account exists, a reset email will be sent." };
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/reset-password/${token}`;

    // Send email
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
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">- ${siteConfig.name} Team</p>
        </div>
      `,
    });

    return { success: true, message: "If an account exists, a reset email will be sent." };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: "Failed to process request. Please try again." };
  }
}

/**
 * Validate token and check if it's valid
 */
export async function validateResetToken(token: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!resetToken) {
      return { valid: false, error: "Invalid reset link." };
    }

    if (resetToken.used) {
      return { valid: false, error: "This reset link has already been used." };
    }

    if (new Date() > resetToken.expiresAt) {
      return { valid: false, error: "This reset link has expired. Please request a new one." };
    }

    return {
      valid: true,
      user: { name: resetToken.user.name, email: resetToken.user.email }
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return { valid: false, error: "Failed to validate token." };
  }
}

/**
 * Verify token and reset password
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    // Validate password strength
    if (newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    // Find and validate the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return { success: false, error: "Invalid reset link." };
    }

    if (resetToken.used) {
      return { success: false, error: "This reset link has already been used." };
    }

    if (new Date() > resetToken.expiresAt) {
      return { success: false, error: "This reset link has expired. Please request a new one." };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);

    // Send confirmation email
    await sendEmail({
      to: resetToken.user.email,
      subject: `Password Changed - ${siteConfig.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed Successfully</h2>
          <p>Hi ${resetToken.user.name},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">- ${siteConfig.name} Team</p>
        </div>
      `,
    });

    return { success: true, message: "Password reset successfully! You can now log in with your new password." };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "Failed to reset password. Please try again." };
  }
}
