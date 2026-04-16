-- CreateTable
CREATE TABLE "technical_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT,
    "category" TEXT NOT NULL,
    "productLine" TEXT,
    "description" TEXT,
    "fileUrl" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'description',
    "iconColor" TEXT NOT NULL DEFAULT 'blue',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technical_resources_pkey" PRIMARY KEY ("id")
);
