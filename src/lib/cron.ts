import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import cron from 'node-cron';

// Initialize Cron Jobs
export function initCronJobs() {
  console.log('Initializing Cron Jobs...');

  // Run every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('Running Fee Reminder Cron Job...');
    await checkFeesDue();
  });
}

async function checkFeesDue() {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Find payments due within the next 3 days or already overdue
    const paymentReceipts = await prisma.paymentReceipts.findMany({
      where: {
        pendingAmount: {
          gt: 0,
        },
        nextDueDate: {
          lte: threeDaysFromNow,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        course: {
            select: {
                title: true
            }
        }
      },
    });

    console.log(`Found ${paymentReceipts.length} pending payments due.`);

    for (const receipt of paymentReceipts) {
      if (!receipt.user.email) continue;

      const isOverdue = receipt.nextDueDate && receipt.nextDueDate < today;
      const dueDateString = receipt.nextDueDate ? receipt.nextDueDate.toLocaleDateString() : 'N/A';

      const message = isOverdue
        ? `Your fee of ₹${receipt.pendingAmount} for ${receipt.course?.title || 'course'} was due on ${dueDateString}. Please pay immediately to avoid penalties.`
        : `Reminder: Your fee of ₹${receipt.pendingAmount} for ${receipt.course?.title || 'course'} is due on ${dueDateString}.`;

      // 1. Send Email to Student
      await sendEmail({
        to: receipt.user.email,
        subject: isOverdue ? 'Overdue Fee Notice' : 'Fee Payment Reminder',
        html: `<p>Dear ${receipt.user.name},</p><p>${message}</p><p>Regards,<br/>Future Ready Admin</p>`
      });

      // 2. Create Notification for Student
      await prisma.notification.create({
        data: {
          userId: receipt.user.id,
          title: isOverdue ? 'Fee Overdue' : 'Fee Reminder',
          message: message,
          type: isOverdue ? 'WARNING' : 'REMINDER',
          link: '/student/finance'
        }
      });

      // 3. Notify Staff (Admins/Finance)
      // For now, let's just log it or notify a generic admin if specific staff assignment isn't clear
      // Or search for all admins
    }

    // Bulk notify admins about the run
    if (paymentReceipts.length > 0) {
        const admins = await prisma.user.findMany({
            where: { role: { name: 'ADMIN' } } // Assuming role relation or checking role name
        });

        // If we can't find by name because Role is a model, we might need another query.
        // Based on schema, User has roleId.
        // Let's optimize this later if needed, for now assuming we can just notify a system channel or iterate.
        // Or create a System Notification.
    }

  } catch (error) {
    console.error('Error in Fee Reminder Cron Job:', error);
  }
}
