import "server-only";
import type { z } from "zod";
import type { ExtractedFromSlackSchema } from "@/lib/zod/extracted-from-slack";
import type { ExtractedResourceFromUrlSchema } from "@/lib/zod/extracted-resource-from-url";
import type { ExtractedInspirationFromUrlSchema } from "@/lib/zod/extracted-inpsiration-from-url";
import { normalizeUrl } from "@/lib/url";
import { extractResourceAndSummariseWithAI } from "./steps/extract-resource-and-summarise-with-ai";
import { createLinkEntryInDatabase } from "./steps/create-link-entry-in-database";
import {
    messageUserAboutNewLinks,
    messageUserAboutExistingLinks,
} from "./steps/message-user";
import type { EmojiReactionType } from "@/lib/slack/emoji-reactions";
import { extractInspiration } from "./steps/extract-inspiration-and-summarise-with-ai";
import { checkExistingUrls } from "./steps/check-existing-urls";

export async function processUrlWorkflow(
    slackData: z.infer<typeof ExtractedFromSlackSchema>,
    emojiReactionType: EmojiReactionType = "resource",
) {
    "use workflow";

    globalThis.fetch = fetch;

    // Normalize all URLs
    const normalizedUrls = slackData.slackLinks.map(
        (link) => normalizeUrl(link.url) ?? link.url,
    );

    // Check which URLs already exist
    const existingLinks = await checkExistingUrls(normalizedUrls);
    const existingUrls = new Set(existingLinks.map((link) => link.url));

    // Notify about existing links
    if (existingLinks.length > 0) {
        await messageUserAboutExistingLinks(slackData, existingLinks);
    }

    // Filter to only new URLs
    const newUrls = normalizedUrls.filter((url) => !existingUrls.has(url));

    if (newUrls.length === 0) {
        return;
    }

    // Process new URLs
    const databaseEntries = await Promise.all(
        newUrls.map(async (url) => {
            const extractedData:
                | z.infer<typeof ExtractedResourceFromUrlSchema>
                | z.infer<typeof ExtractedInspirationFromUrlSchema> =
                emojiReactionType === "resource"
                    ? await extractResourceAndSummariseWithAI(url)
                    : await extractInspiration(url);

            const { link } = await createLinkEntryInDatabase(
                extractedData,
                slackData,
                url,
            );

            return link;
        }),
    );

    await messageUserAboutNewLinks(slackData, databaseEntries);
}
