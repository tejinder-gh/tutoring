import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding users...');

  // 1. Ensure Roles exist
  const roles = ['ADMIN', 'TEACHER', 'STUDENT'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const teacherRole = await prisma.role.findUnique({ where: { name: 'TEACHER' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  if (!adminRole || !teacherRole || !studentRole) {
    throw new Error('Roles could not be found or created.');
  }

  const commonPassword = await hash('password123', 12);

  // 2. Create Admin
  const adminEmail = 'admin@futureready.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roleId: adminRole.id },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: commonPassword,
      roleId: adminRole.id,
    },
  });
  console.log({ admin });

  // 3. Create Teacher
  const teacherEmail = 'teacher@futureready.com';
  const teacher = await prisma.user.upsert({
    where: { email: teacherEmail },
    update: { roleId: teacherRole.id },
    create: {
      email: teacherEmail,
      name: 'John Teacher',
      password: commonPassword,
      roleId: teacherRole.id,
    },
  });

  // Upsert Teacher Profile
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
        userId: teacher.id,
        bio: 'Senior Web Development Instructor',
        domain: 'Web Development', // Mandatory field as per schema
        qualification: 'M.Tech Computer Science'
    }
  });

  console.log({ teacher });

  // 4. Create Student
  const studentEmail = 'student@futureready.com';
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: { roleId: studentRole.id },
    create: {
      email: studentEmail,
      name: 'Alice Student',
      password: commonPassword,
      roleId: studentRole.id,
      phone: '9876543210',
    },
  });

   // Upsert Student Profile
   await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
        userId: student.id,
        enrollmentDate: new Date(),
    }
  });
  console.log({ student });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
