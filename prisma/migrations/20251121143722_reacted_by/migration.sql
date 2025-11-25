/*
  Warnings:

  - Added the required column `reacted_by_display_name` to the `links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reacted_by_slack_user_id` to the `links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "links" ADD COLUMN     "reacted_by_display_name" TEXT NOT NULL,
ADD COLUMN     "reacted_by_slack_user_id" TEXT NOT NULL;
