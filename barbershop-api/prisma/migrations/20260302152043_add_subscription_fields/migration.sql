/*
  Warnings:

  - You are about to drop the `WorkingHour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WorkingHour";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SubscriptionActionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatedById" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    CONSTRAINT "SubscriptionActionLog_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionActionLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'barber',
    "title" TEXT,
    "image" TEXT,
    "selectedUserId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushSubscription" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'pending',
    "subscriptionExpiresAt" DATETIME,
    "subscriptionActivatedAt" DATETIME,
    "subscriptionPausedAt" DATETIME,
    "subscriptionPauseReason" TEXT,
    "subscriptionCancelledAt" DATETIME,
    "subscriptionCancelledReason" TEXT,
    "lastAccessAt" DATETIME,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "workingHours" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("contactNumber", "createdAt", "email", "emailNotificationsEnabled", "firstName", "id", "image", "isEmailVerified", "lastName", "password", "pushNotificationsEnabled", "pushSubscription", "role", "selectedUserId", "subscriptionActivatedAt", "subscriptionExpiresAt", "subscriptionStatus", "title", "updatedAt") SELECT "contactNumber", "createdAt", "email", "emailNotificationsEnabled", "firstName", "id", "image", "isEmailVerified", "lastName", "password", "pushNotificationsEnabled", "pushSubscription", "role", "selectedUserId", "subscriptionActivatedAt", "subscriptionExpiresAt", "subscriptionStatus", "title", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "SubscriptionActionLog_targetUserId_createdAt_idx" ON "SubscriptionActionLog"("targetUserId", "createdAt");
