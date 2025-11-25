export type ExtractFromMessageResult = {
    message: string;
    links: Array<{ url: string; urlText: string | null }>;
};

const extractFromMessage = (
    message: string | undefined,
): ExtractFromMessageResult => {
    if (!message) {
        return { links: [], message: "" };
    }

    const links = message.match(/<([^>]+)>/g);

    if (!links) {
        return { links: [], message };
    }

    const linksWithText = links.map((link) => {
        const url = link.match(/<([^>]+)>/)?.[1];
        const urlText = link.match(/\|([^>]+)/)?.[1];
        return { url: url ?? "", urlText: urlText ?? null };
    });
    return { links: linksWithText, message };
};

export { extractFromMessage };
