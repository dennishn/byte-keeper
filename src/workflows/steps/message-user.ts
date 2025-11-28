import "server-only";
import type { z } from "zod";
import type { ExtractedFromSlackSchema } from "@/lib/zod/extracted-from-slack";
import type { LinkModel, NewsletterModel } from "@/__generated/prisma/models";
import { getSlackClient } from "@/lib/slack/client";

type NewsletterWithLinks = NewsletterModel & {
    links: Array<{
        link: LinkModel;
    }>;
};

const sanitizeHeadline = (headline: string) => headline.replace(/[<>&|]/g, "");

const messageUserAboutNewLinks = async (
    slackData: z.infer<typeof ExtractedFromSlackSchema>,
    links: Array<LinkModel>,
) => {
    "use step";

    const client = getSlackClient();

    const {
        slackSharedByDisplayName,
        slackReactedByDisplayName,
        slackChannelId,
        slackMessageTs,
    } = slackData;

    const sanitisedLinksTexts = links.map((link) => ({
        headline: sanitizeHeadline(link.headline),
        id: link.id,
    }));

    const message = `
Thank you for sharing, <@${slackSharedByDisplayName}> and <@${slackReactedByDisplayName}>! 

The following links have been added to our database:
${sanitisedLinksTexts.map((link) => `- <${process.env.NEXT_PUBLIC_WEB_APP_URL}/links/${link.id}|${link.headline}>`).join("\n")}

We're building a treasure trove together, ${links.length > 1 ? "many links" : "one link"} at a time :heart_on_fire:`;

    await client.chat.postMessage({
        channel: slackChannelId,
        text: message,
        thread_ts: slackMessageTs,
        unfurl_links: true,
        unfurl_media: false,
    });

    return { message };
};

const messageUserAboutExistingLinks = async (
    slackData: z.infer<typeof ExtractedFromSlackSchema>,
    existingLinks: Array<LinkModel>,
) => {
    "use step";

    const client = getSlackClient();

    const { slackChannelId, slackMessageTs } = slackData;

    const sanitisedLinksTexts = existingLinks.map((link) => ({
        headline: sanitizeHeadline(link.headline),
        id: link.id,
        url: link.url,
    }));

    const linksText = sanitisedLinksTexts
        .map(
            (link) =>
                `- <${process.env.NEXT_PUBLIC_WEB_APP_URL}/links/${link.id}|${link.headline}>`,
        )
        .join("\n");

    const message =
        existingLinks.length === 1
            ? `Heads up! This link already exists in our database:\n${linksText}\n\nNo need to add it again :wink:`
            : `Heads up! These ${existingLinks.length} links already exist in our database:\n${linksText}\n\nNo need to add them again :slightly_smiling_face:`;

    await client.chat.postMessage({
        channel: slackChannelId,
        text: message,
        thread_ts: slackMessageTs,
        unfurl_links: false,
        unfurl_media: false,
    });

    return { message };
};

const messageAboutNewsletterReady = async (newsletter: NewsletterWithLinks) => {
    "use step";

    const client = getSlackClient();

    const channelId = process.env.SLACK_NEWSLETTER_READY_CHANNEL_ID;

    if (!channelId) {
        throw new Error("SLACK_NEWSLETTER_READY_CHANNEL_ID is not configured");
    }

    const newsletterUrl = `${process.env.NEXT_PUBLIC_WEB_APP_URL}/newsletters/${newsletter.id}`;

    const message = `
:newspaper: *Newsletter Ready for Review!*

The ${newsletter.month} newsletter has been generated and is ready for your review.

<${newsletterUrl}|:point_right: Review and Approve Newsletter>

Once approved, the newsletter will be sent to all subscribers.`;

    await client.chat.postMessage({
        channel: channelId,
        text: message,
        unfurl_links: false,
        unfurl_media: false,
    });

    return { message };
};

export {
    messageUserAboutNewLinks,
    messageUserAboutExistingLinks,
    messageAboutNewsletterReady,
};
