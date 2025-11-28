import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import type { ExtractedResourceFromUrlSchema } from "@/lib/zod/extracted-resource-from-url";
import type { ExtractedInspirationFromUrlSchema } from "@/lib/zod/extracted-inpsiration-from-url";
import type { ExtractedFromSlackSchema } from "@/lib/zod/extracted-from-slack";

const createLinkEntryInDatabase = async (
    extractedData:
        | z.infer<typeof ExtractedResourceFromUrlSchema>
        | z.infer<typeof ExtractedInspirationFromUrlSchema>,
    slackData: z.infer<typeof ExtractedFromSlackSchema>,
    url: string,
) => {
    "use step";

    const { headline, summary, tags, thumbnail } = extractedData;
    const {
        slackMessageTs,
        slackChannelName,
        slackSharedByDisplayName,
        slackReactedByDisplayName,
        slackLinks,
        slackMessageText,
    } = slackData;

    const linkTags = (tags ?? []).map((tag) => ({
        tag: {
            connect: {
                key: tag,
            },
        },
    }));

    try {
        const link = await prisma.link.create({
            data: {
                url,
                headline,
                summary,
                thumbnail,
                tags: {
                    create: linkTags,
                },
                slackMessageTs,
                slackChannelName,
                slackSharedByDisplayName,
                slackReactedByDisplayName,
                slackLinks,
                slackMessageText,
            },
        });

        return { link };
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error creating link entry in database: ", error);
        throw error;
    }
};

export { createLinkEntryInDatabase };
