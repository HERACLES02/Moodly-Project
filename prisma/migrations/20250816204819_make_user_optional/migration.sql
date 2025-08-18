/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `note` DROP FOREIGN KEY `Note_userId_fkey`;

-- DropIndex
DROP INDEX `Note_userId_fkey` ON `note`;

-- AlterTable
ALTER TABLE `note` DROP COLUMN `updatedAt`,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Note` ADD CONSTRAINT `Note_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
