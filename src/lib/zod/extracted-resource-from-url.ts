import { z } from "zod";

const ExtractedResourceFromUrlSchema = z.object({
    headline: z.string(),
    summary: z.string().optional(),
    thumbnail: z.string().optional(),
    source: z.url(),
    tags: z.array(z.string()).optional(),
});

export { ExtractedResourceFromUrlSchema };
