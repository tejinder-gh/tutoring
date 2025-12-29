"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeacherCurriculumDraft(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Get Teacher Profile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) {
    throw new Error("Only teachers can customize curriculums");
  }

  // 2. Check if a version already exists
  const existingVersion = await prisma.curriculum.findUnique({
    where: {
      courseId_teacherId: {
        courseId,
        teacherId: teacherProfile.id,
      },
    },
  });

  if (existingVersion) {
    return { success: true, curriculumId: existingVersion.id, status: existingVersion.status };
  }

  // 3. Fetch default (Director's) curriculum to clone
  const defaultCurriculum = await prisma.curriculum.findFirst({
    where: {
      courseId,
      teacherId: null,
    },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              resources: true,
              managedResources: true, // Note: Shared, we just link them
              // assignments: true, // Assignments might need deeper cloning or linking?
              // For MVP, cloning assignments creates new instances which is safer for grading.
            }
          }
        }
      },
      quizzes: {
          include: {
              questions: {
                  include: {
                      options: true
                  }
              }
          }
      },
      assignments: true,
      resources: true,
    }
  });

  if (!defaultCurriculum) {
    throw new Error("No default curriculum found for this course");
  }

  // 4. Create new Curriculum (Clone)
  // We use a transaction to ensure all parts are created
  const newCurriculum = await prisma.$transaction(async (tx: any) => {
    const curriculum = await tx.curriculum.create({
      data: {
        courseId,
        teacherId: teacherProfile.id,
        status: "DRAFT",
        versionName: `Custom Version - ${new Date().toLocaleDateString()}`,
        description: defaultCurriculum.description,
      }
    });

    // Clone Resources (Curriculum Level)
    // NOTE: If resources are just links, we can clone the linking record.
    // If they are uploads, we point to the same URL.
    for (const res of defaultCurriculum.resources) {
        await tx.resource.create({
            data: {
                title: res.title,
                url: res.url,
                type: res.type,
                curriculumId: curriculum.id,
                uploadedById: session.user?.id,
            }
        })
    }

    // Clone Modules & Lessons
    for (const mod of defaultCurriculum.modules) {
      const newMod = await tx.module.create({
        data: {
          title: mod.title,
          order: mod.order,
          curriculumId: curriculum.id,
          isActive: mod.isActive,
        }
      });

      for (const lesson of mod.lessons) {
        await tx.lesson.create({
          data: {
            title: lesson.title,
            order: lesson.order,
            moduleId: newMod.id,
            contentUrl: lesson.contentUrl,
            contentType: lesson.contentType,
            richTextContent: lesson.richTextContent,
            videoUrl: lesson.videoUrl,
            isActive: lesson.isActive,
            // Clone resources (Lesson Level)
              resources: {
                  create: lesson.resources.map((r: any) => ({
                      title: r.title,
                      url: r.url,
                      type: r.type
                  }))
              }
          }
        });
      }
    }

    // Clone Quizzes
    for(const quiz of defaultCurriculum.quizzes) {
        if(quiz.lessonId) continue; // Skip lesson-attached quizzes here, handle them if we decide to clone deep lesson attachments differently.
        // Actually, schema shows Quiz has curriculumId.

        await tx.quiz.create({
            data: {
                title: quiz.title,
                description: quiz.description,
                curriculumId: curriculum.id,
                duration: quiz.duration,
                passingScore: quiz.passingScore,
                isActive: quiz.isActive,
                questions: {
                    create: quiz.questions.map((q: any) => ({
                        text: q.text,
                        type: q.type,
                        points: q.points,
                        order: q.order,
                        explanation: q.explanation,
                        options: {
                            create: q.options.map((o: any) => ({
                                text: o.text,
                                isCorrect: o.isCorrect,
                                order: o.order
                            }))
                        }
                    }))
                }
            }
        })
    }

    // Assignments
    for(const assign of defaultCurriculum.assignments) {
        await tx.assignment.create({
            data: {
                title: assign.title,
                description: assign.description,
                dueInDays: assign.dueInDays,
                isActive: assign.isActive,
                curriculumId: curriculum.id
            }
        })
    }

    return curriculum;
  });

  revalidatePath(`/teacher/courses/${courseId}`);
  return { success: true, curriculumId: newCurriculum.id, status: newCurriculum.status };
}

export async function getEffectiveCurriculum(courseId: string) {
  const session = await auth();
  const user = session?.user;

  // Default: Director's version
  const getDirectorVersion = async () => {
    return prisma.curriculum.findFirst({
      where: { courseId, teacherId: null },
      include: {
          modules: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { order: 'asc' }, include: { resources: true } } }
          },
          quizzes: true,
          assignments: true
      },
    });
  };

  if (!user) return getDirectorVersion();

  // 1. If Teacher -> Check for their own version
  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
  if (teacherProfile) {
    const teacherVersion = await prisma.curriculum.findUnique({
      where: {
        courseId_teacherId: {
          courseId,
          teacherId: teacherProfile.id,
        },
      },
      include: {
          modules: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { order: 'asc' }, include: { resources: true } } }
          },
          quizzes: true,
          assignments: true
      },
    });
    // Return teacher version if it exists, otherwise default
    return teacherVersion || getDirectorVersion();
  }

  // 2. If Student -> Check Enrollment -> Batch -> Teacher -> Approved Version
  const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
          enrollments: {
              where: { courseId, status: 'ACTIVE' },
              include: {
                  batch: {
                      include: {
                        teacher: true
                      }
                  }
              }
          }
      }
  });

  if (studentProfile?.enrollments.length) {
    const enrollment = studentProfile.enrollments[0];
    const teacherId = enrollment.batch?.teacherId;

    if (teacherId) {
      const teacherCurriculum = await prisma.curriculum.findUnique({
        where: {
          courseId_teacherId: {
            courseId,
            teacherId,
          },
          // Only show APPROVED versions to students
          status: "APPROVED"
        },
        include: {
            modules: {
                orderBy: { order: 'asc' },
                include: { lessons: { orderBy: { order: 'asc' }, include: { resources: true } } }
            },
            quizzes: true,
            assignments: true
        },
      });
      if (teacherCurriculum) return teacherCurriculum;
    }
  }

  return getDirectorVersion();
}
