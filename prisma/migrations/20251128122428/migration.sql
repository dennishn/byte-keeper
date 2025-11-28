/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "links_url_key" ON "links"("url");
