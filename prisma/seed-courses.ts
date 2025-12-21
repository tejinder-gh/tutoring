import {
    EnrollmentStatus,
    LeadSource,
    LeadStatus,
    Level,
    NotificationType,
    PrismaClient,
    QuestionType
} from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ===========================================================================
  // 1. Create Users & Profiles
  // ===========================================================================

  // PASSWORD: "password123" (hashed)
  const HASHED_PASSWORD = "$2b$10$ZpMeeu9BpOIiKFVAHt7kEuQXKZP8Nl3TChHgxaDfqXF8o7DyKHxNm"

  // ===========================================================================
  // 1a. Create Roles & Permissions
  // ===========================================================================
  const ROLES = [
    'DIRECTOR', 'GENERAL_MANAGER', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER',
    'BUSINESS_ANALYST', 'DIGITAL_MARKETING', 'TEACHER', 'BACKOFFICE', 'STUDENT'
  ];

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `Default ${roleName} role` }
    });
  }
  console.log('✅ Roles seeded');

  // ===========================================================================
  // 1b. Create Permissions
  // ===========================================================================
  const permissionsToCreate = [
    // User management
    { action: 'read', subject: 'user' },
    { action: 'create', subject: 'user' },
    { action: 'update', subject: 'user' },
    { action: 'delete', subject: 'user' },
    { action: 'manage', subject: 'user' },

    // Course management
    { action: 'read', subject: 'course' },
    { action: 'create', subject: 'course' },
    { action: 'update', subject: 'course' },
    { action: 'delete', subject: 'course' },
    { action: 'manage', subject: 'course' },

    // Finance
    { action: 'read', subject: 'finance' },
    { action: 'manage', subject: 'finance' },

    // Reports
    { action: 'read', subject: 'report' },

    // Marketing
    { action: 'manage', subject: 'marketing' },

    // Settings
    { action: 'manage', subject: 'settings' },

    // New additions
    { action: 'manage', subject: 'batch' },
    { action: 'manage', subject: 'enrollment' },
  ];

  for (const perm of permissionsToCreate) {
    await prisma.permission.upsert({
      where: {
        action_subject: {
          action: perm.action,
          subject: perm.subject
        }
      },
      update: {},
      create: perm
    });
  }
  console.log('✅ Permissions seeded');

  // --- DIRECTOR ---
  const director = await prisma.user.upsert({
    where: { email: 'director@future-ready.com' },
    update: {
      password: HASHED_PASSWORD,
      role: { connect: { name: 'DIRECTOR' } }
    },
    create: {
      email: 'director@future-ready.com',
      name: 'Director Admin',
      password: HASHED_PASSWORD,
      role: { connect: { name: 'DIRECTOR' } },
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
    update: {
      password: HASHED_PASSWORD,
      role: { connect: { name: 'TEACHER' } }
    },
    create: {
      email: 'teacher@future-ready.com',
      name: 'Sarah Teacher',
      password: HASHED_PASSWORD,
      role: { connect: { name: 'TEACHER' } },
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
    update: {
      password: HASHED_PASSWORD,
      role: { connect: { name: 'STUDENT' } }
    },
    create: {
      email: 'student@future-ready.com',
      name: 'Alex Student',
      password: HASHED_PASSWORD,
      role: { connect: { name: 'STUDENT' } },
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
  // 1c. Seed Salaries
  // ===========================================================================
  await prisma.salary.create({
    data: {
      teacherProfileId: teacher.teacherProfile.id,
      baseSalary: 50000,
      allowances: 5000,
      effectiveFrom: new Date(),
    }
  });
  console.log('✅ Salary created');

  // ===========================================================================
  // 2. Create Courses, Quizzes & Assignments
  // ===========================================================================

  interface SeedOption {
      text: string;
      isCorrect: boolean;
  }

  interface SeedQuestion {
      text: string;
      type: QuestionType;
      options: SeedOption[];
  }

  interface SeedQuiz {
      title: string;
      questions: SeedQuestion[];
  }

  interface SeedAssignment {
      title: string;
      description: string;
      dueInDays: number;
  }

  interface SeedLesson {
      title: string;
      quiz?: SeedQuiz;
      assignment?: SeedAssignment;
  }

  interface SeedModule {
      title: string;
      lessons: SeedLesson[];
  }

  interface SeedOffering {
      title: string;
      slug: string;
      price: number;
      level: Level;
      thumbnailUrl: string;
      description: string;
      whatYouWillLearn: string[];
      features: string[];
      modules: SeedModule[];
  }

  const offerings: SeedOffering[] = [
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
        {
          title: 'Programming Logic',
          lessons: [
            {
              title: 'Variables & Loops',
              quiz: {
                title: 'JS Basics Quiz',
                questions: [
                  {
                    text: 'Which keyword is used to declare a variable in JavaScript?',
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: 'var', isCorrect: true },
                      { text: 'int', isCorrect: false },
                      { text: 'string', isCorrect: false }
                    ]
                  },
                  {
                    text: 'What is the output of 2 + "2"?',
                    type: QuestionType.MULTIPLE_CHOICE,
                    options: [
                      { text: '4', isCorrect: false },
                      { text: '22', isCorrect: true },
                      { text: 'NaN', isCorrect: false }
                    ]
                  }
                ]
              }
            },
            { title: 'Functions & Scope' }
          ]
        },
        {
          title: 'Version Control',
          lessons: [
            { title: 'Git Basics' },
            { title: 'GitHub Workflow' }
          ]
        }
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
        {
          title: 'React Deep Dive',
          lessons: [
            {
              title: 'Hooks & Context',
              assignment: {
                title: 'Build a Counter App',
                description: 'Create a simple counter using useState and useEffect.',
                dueInDays: 7
              }
            },
            { title: 'Performance Optimization' }
          ]
        },
        {
          title: 'Backend Engineering',
          lessons: [
            { title: 'RESTful APIs' },
            { title: 'Database Design' }
          ]
        }
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
        { title: 'Advanced Engineering', lessons: [{ title: 'TypeScript Patterns' }, { title: 'Microservices' }] },
        { title: 'Career Prep', lessons: [{ title: 'Mock Interviews' }, { title: 'Resume Review' }] }
      ]
    }
  ]

  const createdCourses = [];

  for (const offering of offerings) {
    const course = await prisma.course.upsert({
      where: { slug: offering.slug },
      update: {
        price: offering.price,
        level: offering.level,
        isActive: true,
        features: offering.features,
        whatYouWillLearn: offering.whatYouWillLearn,
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
        isActive: true,
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
              create: mod.lessons.map((lesson, lIdx) => ({
                title: lesson.title,
                order: lIdx + 1,
                content: '<h1>Lesson Content</h1><p>Placeholder content...</p>',
                // Removed nested creation of quizzes/assignments to avoid missing courseId error.
                // These are handled in the Second Pass below.
              }))
            }
          }))
        }
      }
    })

    // Check if we need to fix Course ID links for deeply nested creations that require it (like Quiz/Assignment often link to Course AND Lesson)
    // In schema: Quiz has courseId AND lessonId? Yes.
    // When creating nested in Lesson, lessonId is auto-set. courseId is NOT auto-set by Prisma unless explicitly passed or implied by parent.
    // Since we are creating Course -> Module -> Lesson -> Quiz, the Quiz is nested in Lesson.
    // However, Quiz ALSO has a courseId foreign key.
    // Prisma *might* require us to connect the course explicitly if it can't infer it.
    // But since we are inside `course.create`, we can't connect to the course being created easily in the same transaction for proper ID reference unless we use valid nested writes.
    // `courseId` on `Quiz` is required.
    // Nesting `quizzes` under `Lesson` creates the quiz with `lessonId`.
    // But `courseId` needs to be provided.
    // Prisma allows `course: { connect: { id: ... } }` but we don't have ID yet.
    // BUT! Logic fix:
    // We are creating the course. We can't link back to it in the same create tree efficiently for `courseId`.
    // Actually, we can if we omit `courseId` in the `create` and rely on Prisma... but `courseId` is required.
    // FIX: We should create Quizzes and Assignments AFTER the course is created, or finding a way to pass it.
    // Easier approach: Let's create the course structure first, then iterate to add Quizzes/Assignments.

    // Actually, let's keep it simple. I'll stick to the previous simple logic but for Quizzes/Assignments, I'll add them in a second pass for each course to ensure IDs are available.
    // Or, I can update the schema to make courseId optional on Quiz if Lesson is present? No, schema is fixed.

    createdCourses.push(course);
    console.log(`✅ Course synced: ${course.title}`);
  }

  // Second pass: Add Quizzes and Assignments
  // This is safer.
  for (const offering of offerings) {
     const course = await prisma.course.findUnique({ where: { slug: offering.slug } });
     if (!course) continue;

     for (const mod of offering.modules) {
        // Find module
        // We can't query by name easily, modules are not unique by name globally.
        // We can fetch modules for the course.
        const dbModules = await prisma.module.findMany({
            where: { courseId: course.id, title: mod.title },
            include: { lessons: true }
        });

        const dbModule = dbModules[0];
        if (!dbModule) continue;

        for (const lesson of mod.lessons) {
             const dbLesson = await prisma.lesson.findFirst({
                 where: { moduleId: dbModule.id, title: lesson.title }
             });

             if (!dbLesson) continue;

             // Add Quiz if exists and not already there
             if (lesson.quiz) {
                // Check if quiz exists
                const text = lesson.quiz.title;
                const existing = await prisma.quiz.findFirst({ where: { lessonId: dbLesson.id, title: text } });
                if (!existing) {
                    await prisma.quiz.create({
                        data: {
                            title: text,
                            lessonId: dbLesson.id,
                            courseId: course.id,
                            questions: {
                                create: lesson.quiz.questions.map((q, i) => ({
                                    text: q.text,
                                    type: q.type,
                                    order: i + 1,
                                    options: {
                                        create: q.options.map((o, j) => ({
                                            text: o.text,
                                            isCorrect: o.isCorrect,
                                            order: j + 1
                                        }))
                                    }
                                }))
                            }
                        }
                    });
                    console.log(`   + Added Quiz to ${lesson.title}`);
                }
             }

             // Add Assignment
             if (lesson.assignment) {
                 const existingFn = await prisma.assignment.findFirst({ where: { lessonId: dbLesson.id, title: lesson.assignment.title }});
                 if (!existingFn) {
                     await prisma.assignment.create({
                         data: {
                             title: lesson.assignment.title,
                             description: lesson.assignment.description,
                             dueInDays: lesson.assignment.dueInDays,
                             lessonId: dbLesson.id,
                             courseId: course.id
                         }
                     })
                     console.log(`   + Added Assignment to ${lesson.title}`);
                 }
             }
        }
     }
  }


  // ===========================================================================
  // 3. Create Roadmaps
  // ===========================================================================
  const allCourses = await prisma.course.findMany();

  await prisma.roadmap.upsert({
    where: { id: "roadmap-fullstack" }, // ID hacking for upsert or just use findFirst? Schema has cuid default.
    // Use findFirst logic or just Create if not exists.
    // Since name is not unique, we can't upsert easily on name.
    // Checking if it exists.
    update: {},
    create: {
        name: "Full Stack Developer Path",
        description: "Zero to Hero in Full Stack Development",
        courses: {
            connect: allCourses.map(c => ({ id: c.id }))
        }
    }
  }).catch(() => {
     // If it fails (e.g. ID issue), just ignore or use create.
     // Better validation:
  });

  const roadmapExists = await prisma.roadmap.findFirst({ where: { name: "Full Stack Developer Path" } });
  if (!roadmapExists) {
      await prisma.roadmap.create({
        data: {
            name: "Full Stack Developer Path",
            description: "Zero to Hero in Full Stack Development",
            courses: {
                connect: allCourses.map(c => ({ id: c.id }))
            }
        }
      });
      console.log('✅ Roadmap created');
  }

  // ===========================================================================
  // 4. Create Leads (Marketing Test)
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
  // 5. Enroll Student (Test Enrollment)
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
    await prisma.enrollment.upsert({
      where: {
        studentProfileId_courseId: {
          studentProfileId: student.studentProfile.id,
          courseId: fullStackCourse.id
        }
      },
      update: {
        status: EnrollmentStatus.ACTIVE
      },
      create: {
        studentProfileId: student.studentProfile.id,
        courseId: fullStackCourse.id,
        batchId: batch.id,
        status: EnrollmentStatus.ACTIVE
      }
    })
    console.log('✅ Student enrolled in Full Stack batch')
  }

  // ===========================================================================
  // 6. Seed Notifications
  // ===========================================================================
  await prisma.notification.create({
      data: {
          userId: student.id,
          title: "Welcome to Future Ready",
          message: "We are glad to have you here. Check out your dashboard.",
          type: NotificationType.INFO,
          isRead: false
      }
  });
  console.log('✅ Notification created');

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
