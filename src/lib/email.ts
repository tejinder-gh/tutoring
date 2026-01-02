import { siteConfig } from "@/config/site";
import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (data: EmailPayload) => {
  const { to, subject, html } = data;

  // In development, if no credentials, log the email instead of failing
  if (!process.env.SMTP_USER && process.env.NODE_ENV !== "production") {
    console.log("-----------------------------------------");
    console.log(`[MOCK EMAIL SERVICE] To: ${to}`);
    console.log(`[MOCK EMAIL SERVICE] Subject: ${subject}`);
    console.log(`[MOCK EMAIL SERVICE] Body Probe: ${html.substring(0, 50)}...`);
    console.log("-----------------------------------------");
    return { success: true, message: "Mock email logged" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${siteConfig.name} Support" <support@${siteConfig.name.toLowerCase().replace(/\s/g, '')}.in>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw to prevent crashing the flow, but return failure
    return { success: false, error };
  }
};

export const emailTemplates = {
  paymentReceipt: (userName: string, courseName: string, amount: number, transactionId: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #20284a; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">${siteConfig.name}</h1>
      </div>
      <div style="padding: 20px;">
        <h2>Payment Receipt</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for enrolling in <strong>${courseName}</strong>. We have received your payment of <strong>₹${amount}</strong>.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>You can now access your course from your dashboard.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/learn" style="background-color: #10B981; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
      </div>
    </div>
  `,
  welcome: (userName: string) => `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #20284a; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Welcome to ${siteConfig.name}!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${userName},</p>
        <p>We are thrilled to have you on board. Get ready to upgrade your skills and future-proof your career.</p>
        <p>Explore our courses and start learning today!</p>
        <div style="text-align: center; margin-top: 30px;">
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="background-color: #FFD700; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Courses</a>
        </div>
      </div>
    </div>
  `,
};
