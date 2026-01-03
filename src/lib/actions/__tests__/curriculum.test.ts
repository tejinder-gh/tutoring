/**
 * @jest-environment node
 */
import { auth } from '@/auth';
import { db } from "@/lib/db";
import { addModule, createCourse } from '../academic';
import { createQuiz, submitQuizAttempt } from '../quiz';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: { create: jest.fn() },
    curriculum: { findFirst: jest.fn() },
    module: { findFirst: jest.fn(), create: jest.fn() },
    quiz: { create: jest.fn(), findUnique: jest.fn() },
    quizAttempt: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    questionResponse: { createMany: jest.fn() },
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Curriculum Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-1', role: { name: 'ADMIN' } } });
    });

    describe('Course Management', () => {
        test('createCourse should create course and redirect', async () => {
            const formData = new FormData();
            formData.append('title', 'New Course');
            formData.append('description', 'Test Description');

            await createCourse(formData);

            expect(db.course.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ title: 'New Course' })
            }));
        });

        test('addModule should create module', async () => {
            (db.curriculum.findFirst as jest.Mock).mockResolvedValue({ id: 'curr-1' });
            (db.module.findFirst as jest.Mock).mockResolvedValue({ order: 1 });

            const formData = new FormData();
            formData.append('title', 'Module 1');

            await addModule('course-1', formData);

            expect(db.module.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ title: 'Module 1', order: 2 })
            }));
        });
    });

    describe('Quiz Management', () => {
        test('createQuiz should create quiz', async () => {
            (db.curriculum.findFirst as jest.Mock).mockResolvedValue({ id: 'curr-1' });

            const result = await createQuiz({
                title: 'Quiz 1',
                courseId: 'course-1',
                passingScore: 80
            });

            expect(result.success).toBe(true);
            expect(db.quiz.create).toHaveBeenCalled();
        });

        test('submitQuizAttempt should grade responses', async () => {
            const mockQuiz = {
                id: 'q1',
                passingScore: 50,
                questions: [
                    {
                        id: 'qn1', type: 'MULTIPLE_CHOICE', points: 10,
                        options: [{ id: 'opt1', isCorrect: true }, { id: 'opt2', isCorrect: false }]
                    }
                ]
            };

            (db.quizAttempt.findUnique as jest.Mock).mockResolvedValue({
                id: 'att-1',
                quiz: mockQuiz
            });

            const result = await submitQuizAttempt('att-1', [
                { questionId: 'qn1', selectedIds: ['opt1'] }
            ]);

            expect(result.success).toBe(true);
            expect(result.score).toBe(100);
            expect(result.passed).toBe(true);
            expect(db.quizAttempt.update).toHaveBeenCalled();
        });
    });
});
