-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TEXT,
    "notes" TEXT,
    "progress" INTEGER,
    "totalUnits" INTEGER,
    "currentUnit" INTEGER,
    "itemType" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "passwordHash" TEXT NOT NULL
);
