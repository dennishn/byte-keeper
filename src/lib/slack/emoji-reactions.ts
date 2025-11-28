export type EmojiReactionType = "resource" | "inspiration";

const getAllowedEmojis = (): {
    resourceEmojis: string[];
    inspirationEmojis: string[];
} => {
    const allowedResourceEmojisFromEnv =
        process.env.SLACK_CAPTURE_RESOURCE_EMOJIS || "";

    const allowedInspirationEmojisFromEnv =
        process.env.SLACK_CAPTURE_INSPIRATION_EMOJIS || "";

    return {
        resourceEmojis: allowedResourceEmojisFromEnv
            .split(",")
            .map((emoji) => emoji.trim())
            .filter((emoji) => emoji.length > 0),
        inspirationEmojis: allowedInspirationEmojisFromEnv
            .split(",")
            .map((emoji) => emoji.trim())
            .filter((emoji) => emoji.length > 0),
    };
};

const isAllowedEmoji = (emoji: string) => {
    const { resourceEmojis, inspirationEmojis } = getAllowedEmojis();

    return resourceEmojis.includes(emoji) || inspirationEmojis.includes(emoji);
};

const getEmojiReactionType = (emoji: string): EmojiReactionType | null => {
    const { resourceEmojis, inspirationEmojis } = getAllowedEmojis();

    if (resourceEmojis.includes(emoji)) {
        return "resource";
    } else if (inspirationEmojis.includes(emoji)) {
        return "inspiration";
    }

    return null;
};

export { isAllowedEmoji, getEmojiReactionType };
