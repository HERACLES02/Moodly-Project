/*
  Warnings:

  - You are about to drop the column `title` on the `note` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_userId_fkey`;

-- DropIndex
DROP INDEX `Note_userId_fkey` ON `note`;

-- AlterTable
ALTER TABLE `note` DROP COLUMN `title`,
    DROP COLUMN `userId`;

-- CreateTable
CREATE TABLE `Mood` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
