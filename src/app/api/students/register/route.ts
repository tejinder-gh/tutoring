import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, tier } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A student with this email already exists' },
        { status: 409 }
      );
    }

    // Default password for new students (in production, send email to set password)
    // Using a simple hash for 'Student123!' as default
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Student123!', 10);

    const student = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: { connect: { name: 'STUDENT' } },
        phone, // Add phone to User
        studentProfile: {
          create: {
            // TODO: Create Enrollment record based on tier
            // tier: tier
          }
        }
      },
    });

    return NextResponse.json(
      { success: true, message: 'Registration successful', studentId: student.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering student:', error);
    return NextResponse.json(
      { error: 'Failed to register student' },
      { status: 500 }
    );
  }
}
