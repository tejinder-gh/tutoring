import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create a Teacher
  const email = 'teacher@demo.com'
  // Use a simple hash or placeholder. In real app, use bcrypt.
  // For seeding, we might not need to login as this user immediately, but let's be safe.
  const hashedPassword = '$2a$10$YourHashedPasswordHere'

  const teacherUser = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'John Doe',
      password: hashedPassword,
      role: 'TEACHER',
      teacherProfile: {
        create: {
          specialization: 'Web Development'
        }
      }
    },
    include: { teacherProfile: true }
  })

  const teacherProfileId = teacherUser.teacherProfile?.id
  if (!teacherProfileId) {
      // If teacher exists but no profile, create it
      const newProfile = await prisma.teacherProfile.create({
          data: {
              userId: teacherUser.id,
              specialization: 'Web Development'
          }
      })
      // throw new Error("Teacher profile creation logic check needed")
      console.log('Created missing teacher profile')
  }

  // 2. Create Courses (Offerings)
  const offerings = [
    {
        title: 'Fundamentals of Web Development',
        slug: 'fundamentals',
        price: 45000,
        level: 'Beginner',
        thumbnailUrl: '/images/courses/fundamentals.png',
        description: 'Build a rock-solid base. Master the syntax, logic, and core principles that every engineer needs.',
        metaTitle: 'Programming Fundamentals Course - Future Ready',
        metaDescription: 'Master the basics of programming with JavaScript, PHP, Git and Algorithms. The perfect start for your engineering journey.',
        keywords: ['programming basics', 'javascript', 'php', 'git', 'algorithms'],
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
        level: 'Intermediate',
        thumbnailUrl: '/images/courses/full-stack.png',
        description: 'Stop watching tutorials. Start building real production software in a studio environment.',
        metaTitle: 'MERN Stack Training Bootcamp - Future Ready',
        metaDescription: 'Outcome-driven MERN stack training. Build 3 production projects and master React, Node.js, and System Architecture.',
        keywords: ['mern stack', 'react course', 'nodejs', 'full stack developer', 'project based learning'],
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
        level: 'Advanced',
        thumbnailUrl: '/images/courses/career.png',
        description: 'Transition from coder to professional engineer. Focus on scaling, performance, and leadership.',
        metaTitle: 'Career Advancement for Engineers - Future Ready',
        metaDescription: 'Prepare for top-tier engineering roles. Advanced TypeScript, DevOps, CI/CD, and Placement Assurance.',
        keywords: ['interview prep', 'system design', 'devops', 'typescript', 'career coaching'],
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

  // Basic check for teacher profile again just in case
  const finalTeacher = await prisma.user.findUnique({
      where: { email },
      include: { teacherProfile: true }
  })

  if (!finalTeacher?.teacherProfile) throw new Error("Failed to ensure teacher profile")

  for (const offering of offerings) {
      await prisma.course.upsert({
        where: { slug: offering.slug },
        update: {
            price: offering.price,
            published: true,
            thumbnailUrl: offering.thumbnailUrl,
            keywords: offering.keywords?.join(','),
            whatYouWillLearn: offering.whatYouWillLearn?.join(','),
            features: offering.features?.join(','),
            teachers: {
                connect: { id: finalTeacher.teacherProfile.id }
            }
        },
        create: {
          title: offering.title,
          slug: offering.slug,
          description: offering.description,
          price: offering.price,
          level: offering.level,
          published: true,
          thumbnailUrl: offering.thumbnailUrl,
          metaTitle: offering.metaTitle,
          metaDescription: offering.metaDescription,
          keywords: offering.keywords?.join(','),
          whatYouWillLearn: offering.whatYouWillLearn?.join(','),
          features: offering.features?.join(','),
          teachers: {
            connect: { id: finalTeacher.teacherProfile.id }
          },
          modules: {
            create: offering.modules.map((mod, idx) => ({
                title: mod.title,
                order: idx + 1,
                lessons: {
                    create: mod.lessons.map(lessonTitle => ({
                        title: lessonTitle,
                        content: 'Lesson content placeholder'
                    }))
                }
            }))
          }
        }
      })
      console.log(`Seeding completed for Course: ${offering.title}`)
  }
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
