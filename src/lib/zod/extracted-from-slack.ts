import { z } from "zod";

const ExtractedFromSlackSchema = z.object({
    slackMessageTs: z.string(),
    slackChannelName: z.string(),
    slackSharedByDisplayName: z.string(),
    slackReactedByDisplayName: z.string(),
    slackLinks: z.array(
        z.object({
            url: z.url(),
            urlText: z.string().nullable(),
        }),
    ),
    slackMessageText: z.string(),
});

export { ExtractedFromSlackSchema };
