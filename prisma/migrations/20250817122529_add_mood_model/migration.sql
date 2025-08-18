/*
  Warnings:

  - You are about to drop the `usermood` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `color` to the `Mood` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `usermood` DROP FOREIGN KEY `UserMood_moodId_fkey`;

-- AlterTable
ALTER TABLE `mood` ADD COLUMN `color` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `usermood`;
