/*
  Warnings:

  - You are about to drop the column `tag` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tags_tag_key";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "tag",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tags_key_key" ON "tags"("key");
