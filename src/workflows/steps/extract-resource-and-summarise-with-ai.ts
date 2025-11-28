import "server-only";
import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { ExtractedResourceFromUrlSchema } from "@/lib/zod/extracted-resource-from-url";
import { removeUrlsFromText } from "@/lib/url";

const extractResourceAndSummariseWithAI = async (
    url: string,
): Promise<z.infer<typeof ExtractedResourceFromUrlSchema>> => {
    "use step";

    const model = "openai/gpt-5";

    const tagsFromDatabase = await prisma.tag.findMany();
    const tagsFromDatabaseKeys = tagsFromDatabase.map((tag) => tag.key);

    const { text } = await generateText({
        model,
        system: `
You are a professional frontend technology research analyst tasked with extracting valuable information from a URL for a frontend development newsletter and library of useful links.

You are given a URL and you need to extract the following information:
- The title of the page
- A complelling 2-3 sentence summary highlighting why this is valuable for frontend developers
- Up to 5 relevant tags (only include if truly applicable) - you may only pick from the following list: ${tagsFromDatabaseKeys.join(", ")}.

CRITICAL RULES FOR THE SUMMARY AND HEADLINE:
- Do NOT include URLs of any kind.
- Do NOT include markdown links like [text](url).
- Do NOT include bare domains like "smashingmagazine.com".
- Do NOT add "(source)", "(via ...)" or similar.

Tone of Voice guidelines:
- Casual, confident, and semi-witty — never try-hard.
- Prioritize clarity and usefulness over charm, but allow light personality.
- Assume an expert audience; avoid overexplaining basics.
- Be direct and solution-oriented, not verbose or ceremonial.
- Keep sentences tight; avoid fluff, clichés, and corporate tone.
- Favor intelligent humor through sharp phrasing, not jokes.
- Use emojis where appropriate to make the tone more engaging and friendly.
        `,
        prompt: `Visit and analyze this URL for a frontend development newsletter: ${url}.`,
        maxRetries: 1,
        tools: {
            web_search: openai.tools.webSearch({}),
        },
    });

    const sanitizedText = removeUrlsFromText(text);

    const { object } = await generateObject({
        model,
        schema: ExtractedResourceFromUrlSchema,
        prompt: `
You will receive some text that loosely contains:
- A headline / title
- A 2–3 sentence summary
- Maybe some tags

Your job:
- Map this into the JSON schema (headline, summary, source, tags).
- The "summary" MUST NOT contain any URLs, markdown links, or bare domains.
- If you see anything that looks like a URL or domain, drop it from the summary.
- Use this as the "source" field: "${url}"

Return ONLY a JSON object that matches the schema, with no extra commentary.

TEXT:
"""${sanitizedText}"""
        `,
        maxRetries: 1,
    });

    const validatedObject = ExtractedResourceFromUrlSchema.safeParse(object);

    if (!validatedObject.success) {
        throw new Error("Invalid extracted data");
    }

    return validatedObject.data;
};

export { extractResourceAndSummariseWithAI };
