import { z } from "zod";

const ExtractedInspirationFromUrlSchema = z.object({
    headline: z.string(),
    thumbnail: z.string().optional(),
    summary: z.string().optional(),
    source: z.url(),
    tags: z.array(z.string()).optional(),
});

export { ExtractedInspirationFromUrlSchema };
