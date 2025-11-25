import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { verifySlackSignature } from "@/lib/slack/verify";
import {
    extractFromMessage,
    type ExtractFromMessageResult,
} from "@/lib/slack/extract-from-message";
import type { ExtractedFromSlackSchema } from "@/lib/zod/extracted-from-slack";
import type z from "zod";
import { start } from "workflow/api";
import { processUrlWorkflow } from "@/workflows/process-url";

type SlackUrlVerificationBody = {
    token: string;
    challenge: string;
    type: "url_verification";
};

type SlackEventCallbackBody = {
    token: string;
    team_id: string;
    api_app_id: string;
    event: {
        type: string;
        user: string;
        reaction: string;
        item: {
            type: string;
            channel: string;
            ts: string;
        };
        event_ts: string;
    };
    type: "event_callback";
    event_id: string;
    event_time: number;
};

const isUrlVerification = (body: unknown): body is SlackUrlVerificationBody =>
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    "challenge" in body &&
    "type" in body &&
    body.type === "url_verification";

const isEventCallback = (body: unknown): body is SlackEventCallbackBody =>
    typeof body === "object" &&
    body !== null &&
    "type" in body &&
    body.type === "event_callback" &&
    "event" in body &&
    typeof body.event === "object" &&
    body.event !== null;

export async function POST(request: NextRequest) {
    try {
        const signingSecret = process.env.SLACK_SIGNING_SECRET;
        if (!signingSecret) {
            // eslint-disable-next-line no-console
            console.error("SLACK_SIGNING_SECRET is not configured");
            return NextResponse.json(
                { error: "configuration_error" },
                { status: 500 },
            );
        }

        // Get the raw request body before JSON parsing
        const rawBody = await request.text();

        // Extract headers
        const timestamp = request.headers.get("x-slack-request-timestamp");
        const signature = request.headers.get("x-slack-signature");

        if (!timestamp || !signature) {
            return NextResponse.json(
                { error: "missing_headers" },
                { status: 401 },
            );
        }

        // Verify the request signature
        const isValid = verifySlackSignature(
            signingSecret,
            timestamp,
            signature,
            rawBody,
        );

        if (!isValid) {
            return NextResponse.json(
                { error: "invalid_signature" },
                { status: 401 },
            );
        }

        // Parse the JSON body
        const body = JSON.parse(rawBody) as unknown;

        // Handle URL verification challenge
        if (isUrlVerification(body)) {
            return NextResponse.json({ challenge: body.challenge });
        }

        // Handle event callbacks
        if (isEventCallback(body)) {
            // Acknowledge the event immediately (Slack requires this within 3 seconds)
            const response = NextResponse.json({ ok: true });

            // Process the event asynchronously
            handleEvent(body).catch((error) => {
                // eslint-disable-next-line no-console
                console.error("Error handling Slack event", { error });
            });

            return response;
        }

        // Unknown event type - acknowledge anyway
        return NextResponse.json({ ok: true });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Slack ingestion failed", { error });
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
}

async function handleEvent(body: SlackEventCallbackBody): Promise<void> {
    const { event } = body;

    // Only handle reaction_added events
    if (event.type !== "reaction_added") {
        return;
    }

    // Only process reactions on messages
    if (event.item.type !== "message") {
        return;
    }

    const channelId = event.item.channel;
    const messageTs = event.item.ts;
    const reactionEmoji = event.reaction;
    const reactedByUserId = event.user;

    // Parse allowed emojis from environment variable
    const allowedEmojisEnv = process.env.SLACK_CAPTURE_EMOJIS || "";
    const allowedEmojis = allowedEmojisEnv
        .split(",")
        .map((emoji) => emoji.trim())
        .filter((emoji) => emoji.length > 0);

    // Check if the reaction emoji is in the allowed list
    if (allowedEmojis.length > 0 && !allowedEmojis.includes(reactionEmoji)) {
        // eslint-disable-next-line no-console
        console.log("Reaction emoji not in allowed list", {
            emoji: reactionEmoji,
            allowedEmojis,
        });
        return;
    }

    try {
        const botToken = process.env.SLACK_BOT_TOKEN;
        if (!botToken) {
            throw new Error("SLACK_BOT_TOKEN is not configured");
        }

        const client = new WebClient(botToken);

        // Fetch the message content from Slack
        const historyResult = await client.conversations.history({
            channel: channelId,
            latest: messageTs,
            inclusive: true,
            limit: 1,
        });

        if (!historyResult.messages || historyResult.messages.length === 0) {
            // eslint-disable-next-line no-console
            console.warn("Message not found", { channelId, messageTs });
            return;
        }

        const message = historyResult.messages[0];
        const messageAuthorId = message.user || "";

        // Fetch user info for the message author
        let messageAuthorDisplayName: string | undefined;
        if (messageAuthorId) {
            try {
                const messageAuthorInfo = await client.users.info({
                    user: messageAuthorId,
                });
                messageAuthorDisplayName =
                    messageAuthorInfo.user?.real_name ||
                    messageAuthorInfo.user?.name;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn("Failed to fetch message author info", {
                    error,
                    userId: messageAuthorId,
                });
            }
        }

        // Fetch user info for the user who reacted
        let reactedByDisplayName: string | undefined;
        try {
            const reactedByInfo = await client.users.info({
                user: reactedByUserId,
            });
            reactedByDisplayName =
                reactedByInfo.user?.real_name || reactedByInfo.user?.name;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Failed to fetch reacted by user info", {
                error,
                userId: reactedByUserId,
            });
        }

        let channelName: string | undefined;
        try {
            const channelInfo = await client.conversations.info({
                channel: channelId,
            });
            console.log("CHANNEL INFO:", { channelInfo });
            channelName = channelInfo.channel?.name;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Failed to fetch channel info", { error, channelId });
        }

        let extractedFromSlackMessage: ExtractFromMessageResult = {
            message: "",
            links: [],
        };
        try {
            extractedFromSlackMessage = extractFromMessage(message.text);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Failed to extract from slack message", {
                error,
                message,
            });
        }

        // Extract and log the required data
        const extractedData: z.infer<typeof ExtractedFromSlackSchema> = {
            slackMessageTs: messageTs,
            slackChannelName: channelName || "",
            slackSharedByDisplayName: messageAuthorDisplayName || "",
            slackReactedByDisplayName: reactedByDisplayName || "",
            slackLinks: extractedFromSlackMessage.links,
            slackMessageText: extractedFromSlackMessage.message,
        };

        // eslint-disable-next-line no-console
        console.log("Reaction added event - extracted data:", extractedData);

        // Send reply message to the channel
        // @TODO: Check that we were able to extract links from the message, or reply with a message that we were unable to extract links.
        // @TODO: (nice to have) Check if we have any links stored already with the URLs and if so, reply with a special message about this.
        if (extractedFromSlackMessage.links.length > 0) {
            extractedFromSlackMessage.links.forEach(async (link) => {
                console.log("IS WORKFLOW A THING", typeof processUrlWorkflow);
                await start(processUrlWorkflow, [link.url, extractedData]);
            });

            return;
        } else {
            await client.chat.postMessage({
                channel: channelId,
                text: "I was unable to extract any links from the message. Please try again.",
                thread_ts: messageTs,
            });
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error processing reaction_added event", {
            error,
            channelId,
            messageTs,
        });
        throw error;
    }
}
