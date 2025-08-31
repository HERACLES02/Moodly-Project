/*
  Warnings:

  - You are about to drop the column `lasLoginAt` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "anonymousName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "mood" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" DATETIME,
    "loginStreak" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("anonymousName", "createdAt", "email", "id", "isAdmin", "isBanned", "loginStreak", "mood", "note", "password", "points", "updatedAt") SELECT "anonymousName", "createdAt", "email", "id", "isAdmin", "isBanned", "loginStreak", "mood", "note", "password", "points", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_anonymousName_key" ON "User"("anonymousName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
