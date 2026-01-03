"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { QuestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// =============================================================================
// ADMIN/TEACHER ACTIONS
// =============================================================================

/**
 * Create a new quiz
 */
export async function createQuiz(data: {
  title: string;
  description?: string | undefined;
  courseId: string;
  lessonId?: string | undefined;
  moduleId?: string | undefined;
  duration?: number | undefined;
  passingScore?: number | undefined;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const curriculum = await db.curriculum.findFirst({
        where: { courseId: data.courseId, teacherId: null }
    });

    if (!curriculum) {
        return { success: false, error: "Curriculum not found for this course" };
    }

    const quiz = await db.quiz.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        curriculumId: curriculum.id,
        lessonId: data.lessonId || null,
        moduleId: data.moduleId || null,
        duration: data.duration ?? null,
        passingScore: data.passingScore ?? 70,
      },
    });

    revalidatePath("/admin/quizzes");
    return { success: true, quiz };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return { success: false, error: "Failed to create quiz" };
  }
}

/**
 * Update quiz details
 */
export async function updateQuiz(
  quizId: string,
  data: {
    title?: string;
    description?: string;
    duration?: number;
    passingScore?: number;
    isActive?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const quiz = await db.quiz.update({
      where: { id: quizId },
      data,
    });

    revalidatePath(`/admin/quizzes/${quizId}`);
    return { success: true, quiz };
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return { success: false, error: "Failed to update quiz" };
  }
}

/**
 * Add a question to a quiz
 */
export async function addQuestion(
  quizId: string,
  data: {
    text: string;
    type: QuestionType;
    points?: number | undefined;
    explanation?: string | undefined;
    options?: { text: string; isCorrect: boolean }[] | undefined;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get current max order
    const lastQuestion = await db.question.findFirst({
      where: { quizId },
      orderBy: { order: "desc" },
    });
    const newOrder = lastQuestion ? lastQuestion.order + 1 : 0;

    const question = await db.question.create({
      data: {
        quizId,
        text: data.text,
        type: data.type,
        points: data.points ?? 1,
        order: newOrder,
        explanation: data.explanation ?? null,
        ...(data.options
          ? {
              options: {
                create: data.options.map((opt, idx) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  order: idx,
                })),
              },
            }
          : {}),
      },
      include: { options: true },
    });

    revalidatePath(`/admin/quizzes/${quizId}`);
    return { success: true, question };
  } catch (error) {
    console.error("Failed to add question:", error);
    return { success: false, error: "Failed to add question" };
  }
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  data: {
    text?: string;
    type?: QuestionType;
    points?: number;
    explanation?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const question = await db.question.update({
      where: { id: questionId },
      data,
      include: { quiz: { select: { id: true } } },
    });

    revalidatePath(`/admin/quizzes/${question.quiz.id}`);
    return { success: true, question };
  } catch (error) {
    console.error("Failed to update question:", error);
    return { success: false, error: "Failed to update question" };
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const question = await db.question.delete({
      where: { id: questionId },
      select: { quiz: { select: { id: true } } },
    });

    revalidatePath(`/admin/quizzes/${question.quiz.id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

/**
 * Get all quizzes (admin view)
 */
export async function getAllQuizzes() {
  const quizzes = await db.quiz.findMany({
    include: {
      curriculum: { select: { course: { select: { id: true, title: true } } } },
      lesson: { select: { id: true, title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return quizzes.map(q => ({
      ...q,
      course: q.curriculum?.course || null
  }));
}

/**
 * Get quiz with questions (admin view)
 */
export async function getQuizWithQuestions(quizId: string) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      curriculum: { select: { course: { select: { id: true, title: true } } } },
      lesson: { select: { id: true, title: true } },
      questions: {
        include: { options: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { attempts: true } },
    },
  });

  if (!quiz) return null;
  return { ...quiz, course: quiz.curriculum?.course };
}

// =============================================================================
// STUDENT ACTIONS
// =============================================================================

/**
 * Get quiz for taking (student view - no correct answers)
 */
export async function getQuizForStudent(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId, isActive: true },
    include: {
      curriculum: { select: { course: { select: { id: true, title: true } } } },
      questions: {
        include: {
          options: {
            select: { id: true, text: true, order: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) return null;
  return { ...quiz, course: quiz.curriculum?.course };
}

/**
 * Start a quiz attempt
 */
export async function startQuizAttempt(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if there's already an incomplete attempt
    const existingAttempt = await db.quizAttempt.findFirst({
      where: {
        quizId,
        userId: session.user.id,
        submittedAt: null,
      },
    });

    if (existingAttempt) {
      return { success: true, attempt: existingAttempt };
    }

    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
      },
    });

    return { success: true, attempt };
  } catch (error) {
    console.error("Failed to start quiz attempt:", error);
    return { success: false, error: "Failed to start quiz" };
  }
}

/**
 * Submit quiz attempt with responses
 */
export async function submitQuizAttempt(
  attemptId: string,
  responses: { questionId: string; selectedIds: string[]; textAnswer?: string | undefined }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get the attempt with quiz and questions
    const attempt = await db.quizAttempt.findUnique({
      where: { id: attemptId, userId: session.user.id },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return { success: false, error: "Attempt not found" };
    }

    if (attempt.submittedAt) {
      return { success: false, error: "Already submitted" };
    }

    let totalPoints = 0;
    let earnedPoints = 0;

    // Process each response
    const responseData = responses.map((response) => {
      const question = attempt.quiz.questions.find(
        (q) => q.id === response.questionId
      );
      if (!question) return null;

      totalPoints += question.points;

      // Calculate if correct for MCQ types
      let isCorrect: boolean | null = null;
      let pointsEarned = 0;

      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "TRUE_FALSE"
      ) {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect =
          response.selectedIds.length === 1 &&
          response.selectedIds[0] === correctOption?.id;
        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += pointsEarned;
        }
      } else if (question.type === "MULTIPLE_SELECT") {
        const correctIds = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id)
          .sort();
        const selectedSorted = [...response.selectedIds].sort();
        isCorrect =
          correctIds.length === selectedSorted.length &&
          correctIds.every((id, idx) => id === selectedSorted[idx]);
        if (isCorrect) {
          pointsEarned = question.points;
          earnedPoints += pointsEarned;
        }
      }
      // SHORT_ANSWER requires manual grading - isCorrect stays null

      return {
        attemptId,
        questionId: response.questionId,
        selectedIds: response.selectedIds,
        textAnswer: response.textAnswer || null,
        isCorrect,
        pointsEarned,
      };
    }).filter(Boolean);

    // Create responses
    await db.questionResponse.createMany({
      data: responseData as any[],
    });

    // Calculate final score
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= attempt.quiz.passingScore;

    // Update attempt
    await db.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: new Date(),
        score,
        passed,
      },
    });

    revalidatePath("/student/learn");
    return { success: true, score, passed };
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return { success: false, error: "Failed to submit quiz" };
  }
}

/**
 * Get quiz result for student
 */
export async function getQuizResult(attemptId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const attempt = await db.quizAttempt.findUnique({
    where: { id: attemptId, userId: session.user.id },
    include: {
      quiz: {
        include: {
          questions: {
            include: {
              options: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      responses: true,
    },
  });

  if (!attempt || !attempt.submittedAt) return null;

  return attempt;
}

/**
 * Get quizzes for a course/lesson (student view)
 */
export async function getQuizzesForCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const quizzes = await db.quiz.findMany({
    where: { curriculum: { courseId, teacherId: null }, isActive: true },
    include: {
      lesson: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { userId: session.user.id },
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: { id: true, score: true, passed: true, submittedAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return quizzes;
}
