/*
  Warnings:

  - You are about to drop the column `reacted_by_display_name` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `reacted_by_slack_user_id` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `shared_by_display_name` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `shared_by_slack_user_id` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `slack_channel_id` on the `links` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `links` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slack_message_ts]` on the table `links` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slack_channel_name` to the `links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slack_links` to the `links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slack_message_text` to the `links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slack_reacted_by_display_name` to the `links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slack_shared_by_display_name` to the `links` table without a default value. This is not possible if the table is not empty.
  - Made the column `shared_at` on table `links` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "links_slack_message_ts_url_key";

-- AlterTable
ALTER TABLE "links" DROP COLUMN "reacted_by_display_name",
DROP COLUMN "reacted_by_slack_user_id",
DROP COLUMN "shared_by_display_name",
DROP COLUMN "shared_by_slack_user_id",
DROP COLUMN "slack_channel_id",
DROP COLUMN "url",
ADD COLUMN     "slack_channel_name" TEXT NOT NULL,
ADD COLUMN     "slack_links" JSONB NOT NULL,
ADD COLUMN     "slack_message_text" TEXT NOT NULL,
ADD COLUMN     "slack_reacted_by_display_name" TEXT NOT NULL,
ADD COLUMN     "slack_shared_by_display_name" TEXT NOT NULL,
ALTER COLUMN "shared_at" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "links_slack_message_ts_key" ON "links"("slack_message_ts");
