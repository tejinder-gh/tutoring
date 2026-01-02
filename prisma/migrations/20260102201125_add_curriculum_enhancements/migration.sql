-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "moduleId" TEXT;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "richTextContent" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "moduleId" TEXT;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "moduleId" TEXT;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
