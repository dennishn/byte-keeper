/*
  Warnings:

  - You are about to drop the column `html_body` on the `newsletters` table. All the data in the column will be lost.
  - You are about to drop the column `text_body` on the `newsletters` table. All the data in the column will be lost.
  - Added the required column `introduction_text` to the `newsletters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "newsletters" DROP COLUMN "html_body",
DROP COLUMN "text_body",
ADD COLUMN     "introduction_text" TEXT NOT NULL;
