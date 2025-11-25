import { LinkCreateInputSchema } from "@/lib/zod/link";
import { generateObject, tool } from "ai";
import { z } from "zod";
import { AVAILABLE_TAGS } from "@/lib/tags/constants";

const createLinkEntryTool = tool({
    description: "Create a link entry in the database.",
    inputSchema: z.object({
        excerpt: z.string(),
    }),
    execute: async ({ excerpt }) => {
        console.log("THIS IS THE CREATE LINK ENTRY TOOL:", { excerpt });

        const { object } = await generateObject({
            model: "google/gemini-2.5-flash-lite",
            schema: LinkCreateInputSchema,
            prompt: `
                Create a link entry in the database based on the excerpt.
                Excerpt: ${excerpt}
                You must use the following tags: ${AVAILABLE_TAGS.join(", ")}. If you are not sure about the tags, don't add any.
            `,
        });

        return object;
    },
});

export { createLinkEntryTool };
