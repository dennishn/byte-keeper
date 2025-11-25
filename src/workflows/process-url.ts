import "server-only";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { z } from "zod";
// import dotenv from "dotenv";
// import { PrismaNeon } from "@prisma/adapter-neon";
// import { ExtractedFromUrlSchema } from "@/lib/zod/extracted-from-url";
import type { ExtractedFromSlackSchema } from "@/lib/zod/extracted-from-slack";
// import { PrismaClient } from "@/__generated/prisma/client";

const extractWithAI = async (url: string): Promise<string> => {
    "use step";

    const { text } = await generateText({
        model: "openai/gpt-5",
        // schema: ExtractedFromUrlSchema,
        prompt: `Visit and analyze this URL for a frontend development newsletter: ${url}

Extract:
1. The title of the page
2. A compelling 2-3 sentence summary highlighting why this is valuable for frontend developers
3. Up to 5 relevant tags (only include if truly applicable)

Make sure to actually visit the URL and analyze its content.`,
        maxOutputTokens: 1000,
        tools: {
            web_search: openai.tools.webSearch({}),
        },
    });

    console.log("Extracted data:", text);

    return text;
};

// const saveToDatabase = async (
//     extractedData: string,
//     slackData: z.infer<typeof ExtractedFromSlackSchema>,
// ) => {
//     "use step";

//     dotenv.config({ path: ".env.local" });

//     const connectionString = `${process.env.DATABASE_URL}`;

//     const adapter = new PrismaNeon({ connectionString });
//     const prisma = new PrismaClient({ adapter });

//     const link = await prisma.link.create({
//         data: {
//             ...extractedData,
//             ...slackData,
//         },
//     });

//     return { linkId: link.id };
// };

const messageUser = async (
    slackData: z.infer<typeof ExtractedFromSlackSchema>,
) => {
    "use step";

    const { slackSharedByDisplayName, slackReactedByDisplayName } = slackData;

    const message = `Thank you for sharing, <@${slackSharedByDisplayName}> and <@${slackReactedByDisplayName}>! We're building a treasure trove together, one link at a time :heart_on_fire:`;

    return { message };
};

export async function processUrlWorkflow(
    url: string,
    // slackData: z.infer<typeof ExtractedFromSlackSchema>,
) {
    "use workflow";

    globalThis.fetch = fetch;

    const extractedData = await extractWithAI(url);
    console.log("extractedData", extractedData);

    // const { linkId } = await saveToDatabase(extractedData, slackData);
    // console.log("linkId", linkId);

    // const { message } = await messageUser(slackData);

    // return { linkId, message };
    return;
}
