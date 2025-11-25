/*
  Warnings:

  - You are about to drop the column `shared_at` on the `links` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "links_shared_at_idx";

-- AlterTable
ALTER TABLE "links" DROP COLUMN "shared_at";
