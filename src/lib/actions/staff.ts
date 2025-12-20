"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  domain: z.string().min(2),
});

export async function createTeacher(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    domain: formData.get("domain"),
  };

  const validation = TeacherSchema.safeParse(rawData);

  if (!validation.success) {
    console.error("Validation failed", validation.error);
    return;
  }

  const { name, email, password, domain } = validation.data;

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
      // In prod, return error state
      console.error("User exists");
      return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
      data: {
          name,
          email,
          password: hashedPassword,
          role: "TEACHER",
          teacherProfile: {
              create: {
                  domain
              }
          }
      }
  });

  revalidatePath("/admin/teachers");
}
