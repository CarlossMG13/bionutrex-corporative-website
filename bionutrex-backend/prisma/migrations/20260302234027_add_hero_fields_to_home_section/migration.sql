-- AlterTable
ALTER TABLE "home_sections" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "mediaType" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "titleSegments" TEXT,
ADD COLUMN     "videoMuted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "videoUrl" TEXT;
