import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return { userId: session.user.id, role: (session.user as any).role };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  assignmentSubmission: f({ pdf: { maxFileSize: "4MB" }, text: { maxFileSize: "1MB" }, image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => await handleAuth())
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // Lesson content upload (markdown/MDX files)
  lessonContent: f({ text: { maxFileSize: "512KB" } })
    .middleware(async () => {
      const authData = await handleAuth();
      // Only allow admin/teacher/director roles
      const roleName = authData.role?.name;
      if (!roleName || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(roleName)) {
        throw new Error('Unauthorized: Only admins and teachers can upload lesson content');
      }
      return authData;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // General resource uploads (PDF, Image, Video, etc.)
  resourceFile: f({
    pdf: { maxFileSize: "16MB" },
    image: { maxFileSize: "8MB" },
    video: { maxFileSize: "64MB" },
    text: { maxFileSize: "1MB" },
    blob: { maxFileSize: "16MB" }
  })
    .middleware(async () => {
      const authData = await handleAuth();
      // Only allow admin/teacher/director roles
      const roleName = authData.role?.name;
      if (!roleName || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(roleName)) {
        throw new Error('Unauthorized: Only admins and teachers can upload resources');
      }
      return authData;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Resource uploaded by:', metadata.userId);
      console.log('File URL:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
