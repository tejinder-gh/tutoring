import { EnrollmentStatus, LeadSource, LeadStatus, Level, PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ===========================================================================
  // 1. Create Users & Profiles
  // ===========================================================================

  // PASSWORD: "password123" (hashed)
  const HASHED_PASSWORD = "$2a$10$wT.fMvjt.v8z.lGz.wT.fMvjt.v8z.lGz.wT.fMvjt.v8z.lGz.wT.fM" // Placeholder hash

  // --- DIRECTOR ---
  const director = await prisma.user.upsert({
    where: { email: 'director@future-ready.com' },
    update: {},
    create: {
      email: 'director@future-ready.com',
      name: 'Director Admin',
      password: HASHED_PASSWORD,
      role: Role.DIRECTOR,
      staffProfile: {
        create: {
          department: 'Management',
          designation: 'Director'
        }
      }
    }
  })

  // --- TEACHER ---
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@future-ready.com' },
    update: {},
    create: {
      email: 'teacher@future-ready.com',
      name: 'Sarah Teacher',
      password: HASHED_PASSWORD,
      role: Role.TEACHER,
      teacherProfile: {
        create: {
          domain: 'Web Development',
          bio: 'Senior Full Stack Developer with 10 years of experience.',
          qualification: 'M.S. Computer Science'
        }
      }
    },
    include: { teacherProfile: true }
  })

  if (!teacher.teacherProfile) throw new Error("Teacher profile not created")

  // --- STUDENT ---
  const student = await prisma.user.upsert({
    where: { email: 'student@future-ready.com' },
    update: {},
    create: {
      email: 'student@future-ready.com',
      name: 'Alex Student',
      password: HASHED_PASSWORD,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          enrollmentDate: new Date()
        }
      }
    },
    include: { studentProfile: true }
  })
  if (!student.studentProfile) throw new Error("Student profile not created")

  console.log('✅ Users created')

  // ===========================================================================
  // 2. Create Courses
  // ===========================================================================

  const offerings = [
    {
      title: 'Fundamentals of Web Development',
      slug: 'fundamentals',
      price: 45000,
      level: Level.BEGINNER,
      thumbnailUrl: '/images/courses/fundamentals.png',
      description: 'Build a rock-solid base. Master the syntax, logic, and core principles that every engineer needs.',
      whatYouWillLearn: [
        'Master JavaScript & PHP Syntax',
        'Understand Core Data Structures',
        'Develop Algorithmic Thinking',
        'Learn Version Control with Git'
      ],
      features: [
        'Language Basics (JS/PHP)',
        'Data Structures Introduction',
        'Algorithmic Thinking',
        'Version Control (Git)'
      ],
      modules: [
        { title: 'Programming Logic', lessons: ['Variables & Loops', 'Functions & Scope'] },
        { title: 'Version Control', lessons: ['Git Basics', 'GitHub Workflow'] }
      ]
    },
    {
      title: 'Full Stack Hands-on Training',
      slug: 'full-stack-training',
      price: 95000,
      level: Level.INTERMEDIATE,
      thumbnailUrl: '/images/courses/full-stack.png',
      description: 'Stop watching tutorials. Start building real production software in a studio environment.',
      whatYouWillLearn: [
        'Build Full Stack Apps with MERN',
        'Master React Hooks & State Management',
        'Design Scalable Backend APIs',
        'Deploy to Production'
      ],
      features: [
        'Full Stack Development (MERN)',
        'Daily Code Reviews',
        '3 Production Projects',
        'System Architecture'
      ],
      modules: [
        { title: 'React Deep Dive', lessons: ['Hooks & Context', 'Performance Optimization'] },
        { title: 'Backend Engineering', lessons: ['RESTful APIs', 'Database Design'] }
      ]
    },
    {
      title: 'Career Advancement & Placement',
      slug: 'career-advancement',
      price: 135000,
      level: Level.ADVANCED,
      thumbnailUrl: '/images/courses/career.png',
      description: 'Transition from coder to professional engineer. Focus on scaling, performance, and leadership.',
      features: [
        'Advanced TypeScript',
        'DevOps & CI/CD',
        'Interview Preparation',
        'Placement Assurance'
      ],
      whatYouWillLearn: [
        'Write Type-Safe Code with TypeScript',
        'Implement CI/CD Pipelines',
        'Master System Design Interviews',
        'Secure a High-Paying Job'
      ],
      modules: [
        { title: 'Advanced Engineering', lessons: ['TypeScript Patterns', 'Microservices'] },
        { title: 'Career Prep', lessons: ['Mock Interviews', 'Resume Review'] }
      ]
    }
  ]

  for (const offering of offerings) {
    const course = await prisma.course.upsert({
      where: { slug: offering.slug },
      update: {
        price: offering.price,
        level: offering.level,
        isActive: true,
        features: offering.features, // JSON array
        whatYouWillLearn: offering.whatYouWillLearn, // JSON array
        teachers: {
          connect: { id: teacher.teacherProfile.id }
        }
      },
      create: {
        title: offering.title,
        slug: offering.slug,
        description: offering.description,
        price: offering.price,
        level: offering.level,
        isActive: true, // Replaces 'published'
        thumbnailUrl: offering.thumbnailUrl,
        features: offering.features,
        whatYouWillLearn: offering.whatYouWillLearn,
        teachers: {
          connect: { id: teacher.teacherProfile.id }
        },
        modules: {
          create: offering.modules.map((mod, idx) => ({
            title: mod.title,
            order: idx + 1,
            lessons: {
              create: mod.lessons.map((lessonTitle, lIdx) => ({
                title: lessonTitle,
                order: lIdx + 1,
                content: '<h1>Lesson Content</h1><p>Placeholder content...</p>'
              }))
            }
          }))
        }
      }
    })
    console.log(`✅ Course synced: ${course.title}`)
  }

  // ===========================================================================
  // 3. Create Leads (Marketing Test)
  // ===========================================================================
  const demoLead = await prisma.lead.create({
    data: {
      name: 'Interested Prospect',
      phone: '1234567890',
      email: 'prospect@gmail.com',
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      courseInterest: 'full-stack-training'
    }
  })
  console.log('✅ Demo lead created')

  // ===========================================================================
  // 4. Enroll Student (Test Enrollment)
  // ===========================================================================
  const fullStackCourse = await prisma.course.findUnique({ where: { slug: 'full-stack-training' } })

  if (fullStackCourse && student.studentProfile) {
    // Create a batch
    const batch = await prisma.batch.create({
      data: {
        name: 'FS-Web-Jan-2025',
        startDate: new Date(),
        courseId: fullStackCourse.id,
        students: {
            connect: { id: student.studentProfile.id }
        }
      }
    })

    // Enroll student
    await prisma.enrollment.create({
      data: {
        studentProfileId: student.studentProfile.id,
        courseId: fullStackCourse.id,
        batchId: batch.id,
        status: EnrollmentStatus.ACTIVE
      }
    })
    console.log('✅ Student enrolled in Full Stack batch')
  }

  console.log('🏁 Seeding completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
