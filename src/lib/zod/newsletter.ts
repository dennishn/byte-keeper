import type { Prisma } from "@/__generated/prisma/client";
import { z } from "zod";

const NewsletterCreateInputSchema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    publishedAt: z.date().optional(),
    isPublished: z.boolean().optional(),
    approvedBy: z.string().optional(),
    subject: z.string(),
    introductionText: z.string(),
}) satisfies z.Schema<Prisma.NewsletterCreateInput>;

export { NewsletterCreateInputSchema };
