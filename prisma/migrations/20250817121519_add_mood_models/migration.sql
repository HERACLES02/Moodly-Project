/*
  Warnings:

  - You are about to drop the column `color` on the `mood` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `mood` table. All the data in the column will be lost.
  - You are about to drop the `note` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Mood` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `mood` DROP COLUMN `color`,
    DROP COLUMN `updatedAt`;

-- DropTable
DROP TABLE `note`;

-- CreateTable
CREATE TABLE `UserMood` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `moodId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Mood_name_key` ON `Mood`(`name`);

-- AddForeignKey
ALTER TABLE `UserMood` ADD CONSTRAINT `UserMood_moodId_fkey` FOREIGN KEY (`moodId`) REFERENCES `Mood`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
