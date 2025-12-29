// Notification utilities for sending alerts on new leads
// Configure these with your actual API keys in .env

import { Lead } from '@prisma/client';

/**
 * Send email notification using Resend API
 * Get your API key from https://resend.com
 */
export async function sendEmailNotification(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL || 'admin@futureready.com';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'big O  <notifications@futureready.com>',
        to: [toEmail],
        subject: `🔥 New Lead: ${lead.name}`,
        html: `
          <h2>New Lead Received!</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
          <p><strong>Status:</strong> ${lead.status}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          <br>
          <p>Contact them within 24 hours for best conversion!</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API returned ${response.status}`);
    }

    console.log('Email notification sent for lead:', lead.id);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    throw error;
  }
}

/**
 * Send WhatsApp notification using Twilio API
 * Get your credentials from https://twilio.com
 *
 * Alternative: You can replace this with a Telegram bot or other service
 */
export async function sendWhatsAppNotification(lead: Lead): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'
  const toNumber = process.env.TWILIO_WHATSAPP_TO; // e.g., 'whatsapp:+919876543210'

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    console.warn('Twilio WhatsApp not configured, skipping notification');
    return;
  }

  const message = `🔥 *New Lead!*

Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email}
Status: ${lead.status}

_Contact them ASAP!_`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API returned ${response.status}`);
    }

    console.log('WhatsApp notification sent for lead:', lead.id);
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
    throw error;
  }
}
