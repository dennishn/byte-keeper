-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shared_at" TIMESTAMP(3),
    "slack_message_ts" TEXT NOT NULL,
    "slack_channel_id" TEXT NOT NULL,
    "shared_by_slack_user_id" TEXT NOT NULL,
    "shared_by_display_name" TEXT,
    "headline" TEXT NOT NULL,
    "summary" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletters" (
    "id" TEXT NOT NULL,
    "month" VARCHAR(7) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "subject" VARCHAR(160) NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT,

    CONSTRAINT "newsletters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_tags" (
    "link_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "link_tags_pkey" PRIMARY KEY ("link_id","tag_id")
);

-- CreateTable
CREATE TABLE "newsletter_links" (
    "newsletter_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "newsletter_links_pkey" PRIMARY KEY ("newsletter_id","link_id")
);

-- CreateIndex
CREATE INDEX "links_slack_message_ts_idx" ON "links"("slack_message_ts");

-- CreateIndex
CREATE INDEX "links_shared_at_idx" ON "links"("shared_at");

-- CreateIndex
CREATE UNIQUE INDEX "links_slack_message_ts_url_key" ON "links"("slack_message_ts", "url");

-- CreateIndex
CREATE UNIQUE INDEX "newsletters_month_key" ON "newsletters"("month");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tag_key" ON "tags"("tag");

-- AddForeignKey
ALTER TABLE "link_tags" ADD CONSTRAINT "link_tags_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_tags" ADD CONSTRAINT "link_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_links" ADD CONSTRAINT "newsletter_links_newsletter_id_fkey" FOREIGN KEY ("newsletter_id") REFERENCES "newsletters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_links" ADD CONSTRAINT "newsletter_links_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
