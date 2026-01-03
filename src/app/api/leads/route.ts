import { db } from "@/lib/db";
import { sendEmailNotification, sendWhatsAppNotification } from '@/utils/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, status } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, phone, and email are required' },
        { status: 400 }
      );
    }

    // Save lead to database
    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email,
        status: 'NEW',
        source: 'WEBSITE',
      },
    });

    // Send notifications (non-blocking)
    Promise.all([
      sendEmailNotification(lead).catch(console.error),
      sendWhatsAppNotification(lead).catch(console.error),
    ]);

    return NextResponse.json(
      { success: true, message: 'Lead submitted successfully', leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
