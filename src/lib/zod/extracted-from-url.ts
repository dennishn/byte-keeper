import { z } from "zod";

const ExtractedFromUrlSchema = z.object({
    headline: z.string(),
    summary: z.string().optional(),
});

export { ExtractedFromUrlSchema };
