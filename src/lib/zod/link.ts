import type { Prisma } from "@/__generated/prisma/client";
import type { z } from "zod";
import { ExtractedFromSlackSchema } from "./extracted-from-slack";
import { ExtractedFromUrlSchema } from "./extracted-from-url";

const LinkCreateInputSchema = ExtractedFromSlackSchema.extend(
    ExtractedFromUrlSchema.omit({ tags: true }).shape,
) satisfies z.Schema<Prisma.LinkCreateInput>;

export { LinkCreateInputSchema };
