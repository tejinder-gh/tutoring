import { z } from "zod";

// Example Schema (representing an API contract)
// In a real app, import this from your shared schema definition file
const CourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  isActive: z.boolean(),
});

const LoginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
  token: z.string().optional(),
});

describe("API Contracts", () => {
  it("should validate a valid Course payload", () => {
    const validCourse = {
      id: "course_123",
      title: "Advanced React",
      price: 4999,
      isActive: true,
    };
    const result = CourseSchema.safeParse(validCourse);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid Course payload (negative price)", () => {
    const invalidCourse = {
      id: "course_123",
      title: "Advanced React",
      price: -100,
      isActive: true,
    };
    const result = CourseSchema.safeParse(invalidCourse);
    expect(result.success).toBe(false);
  });

  it("should confirm Login Mock matches the schema", () => {
    // This mimics testing an API response against the expected contract
    const mockApiResponse = {
      user: {
        id: "user_001",
        email: "test@example.com",
      },
      // token is optional
    };
    const result = LoginResponseSchema.safeParse(mockApiResponse);
    expect(result.success).toBe(true);
  });
});
