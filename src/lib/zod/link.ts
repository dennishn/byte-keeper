import type { Prisma } from "@/__generated/prisma/client";
import { z } from "zod";
import { ExtractedFromSlackSchema } from "./extracted-from-slack";
import { ExtractedFromUrlSchema } from "./extracted-resource-from-url";

const LinkCreateInputSchema = ExtractedFromSlackSchema.extend(
    ExtractedFromUrlSchema.omit({ tags: true }).shape,
).extend({
    url: z.string(),
}) satisfies z.Schema<Prisma.LinkCreateInput>;

export { LinkCreateInputSchema };
