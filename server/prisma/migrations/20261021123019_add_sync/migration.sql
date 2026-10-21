-- AlterTable
ALTER TABLE "Card" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Card" ADD COLUMN "source" TEXT;
ALTER TABLE "Card" ADD COLUMN "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "SyncAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "msAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiry" DATETIME NOT NULL,
    "scopes" TEXT NOT NULL,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SyncRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fromEmail" TEXT,
    "keyword" TEXT,
    "accountId" TEXT,
    "areaId" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncAccount_msAccountId_key" ON "SyncAccount"("msAccountId");
