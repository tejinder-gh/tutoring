"use server";

import { auth } from "@/auth";
import { env } from "@/env.mjs";
import { emailTemplates, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";

// Initialize Razorpay
// Note: In production, these should be in .env.
// Using fallback or existing env vars.
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.price || Number(course.price) === 0) {
      throw new Error("Course is free or price not set");
  }

  const options = {
    amount: (Number(course.price) * 100).toString(), // Razorpay expects amount in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}_${session.user.id.slice(0, 5)}`,
    notes: {
        courseId: course.id,
        userId: session.user.id
    }
  };

  try {
    const order = await razorpay.orders.create(options);
    return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: env.RAZORPAY_KEY_ID
    };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    throw new Error("Failed to create payment order");
  }
}

export async function verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    courseId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const generatedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    throw new Error("Invalid payment signature");
  }

  // Payment verified, update DB
  try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) throw new Error("Course not found");

      // 1. Create Payment Receipt
      await prisma.paymentReceipts.create({
          data: {
              userId: session.user.id,
              courseId: courseId,
              amountPaid: Number(course.price),
              expectedAmount: Number(course.price),
              pendingAmount: 0,
              paymentMethod: 'UPI', // Assuming most common, or generic 'CARD'
              reference: paymentId,
              notes: `Enrollment for ${course.title} via Razorpay`,
              paymentDate: new Date()
          }
      });

      // 2. Enroll Student (or activate enrollment)
      // Check if student profile exists, if not create/link?
      // Assuming StudentProfile exists for signed-in user or creating if user has role.
      // For now, let's assume `StudentProfile` logic is handled elsewhere or user has one.

      let studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: session.user.id }
      });

      if (!studentProfile) {
          // Auto-create profile if missing (and assume they are student now)
          studentProfile = await prisma.studentProfile.create({
              data: { userId: session.user.id }
          });
          // Update user role to STUDENT if not already? Or keep as is.
      }

      await prisma.enrollment.upsert({
          where: {
              studentProfileId_courseId: {
                  studentProfileId: studentProfile.id,
                  courseId: courseId
              }
          },
          update: {
              status: 'ACTIVE',
              enrolledAt: new Date()
          },
          create: {
              studentProfileId: studentProfile.id,
              courseId: courseId,
              status: 'ACTIVE'
          }
      });

      revalidatePath("/student/payments");

      // 3. Send Email & Create Notification (Side Effects)
      // fetch locale from somewhere or default to en?
      // Since it's a server action, `next-intl` might auto-detect from headers if middleware passes it.
      // But for robustness, we can try to assume 'en' or fetch user preference later.
      const t = await getTranslations("notifications");
      const tEmail = await getTranslations("email");

      // Send Email
      const emailSubject = tEmail("paymentSubject", { course: course.title });
      if (session.user.email) {
        await sendEmail({
          to: session.user.email,
          subject: emailSubject,
          html: emailTemplates.paymentReceipt(
              session.user.name || "Student",
              course.title,
              Number(course.price),
              paymentId
          )
        });
      }

      // Create Notification
      const notifTitle = t("paymentSuccess.title");
      const notifMessage = t("paymentSuccess.message", { course: course.title });

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: notifTitle,
          message: notifMessage,
          type: "SUCCESS",
          link: `/student/learn/${course.id}`,
        }
      });

      return { success: true };

  } catch (error) {
      console.error("DB Update Error after Payment:", error);
      throw new Error("Payment verified but failed to update records. Please contact support.");
  }
}
