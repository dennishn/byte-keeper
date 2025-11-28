import { WebClient } from "@slack/web-api";

const getSlackClient = () => {
    const botToken = process.env.SLACK_BOT_TOKEN;

    if (!botToken) {
        throw new Error("SLACK_BOT_TOKEN is not configured");
    }

    return new WebClient(botToken);
};

export { getSlackClient };
