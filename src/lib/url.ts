/**
 * Normalizes a URL by removing query params, hash, and trailing slashes.
 * @param url
 * @returns The normalized URL or null if the URL is invalid.
 */
const normalizeUrl = (url: string): string | null => {
    try {
        const value = url.trim();

        const parsed = new URL(
            value.startsWith("http") ? value : `https://${value}`,
        );

        parsed.hash = "";
        parsed.searchParams.forEach((_, key) => {
            parsed.searchParams.delete(key);
        });

        // Remove trailing slash for consistency (except for root domain)
        let normalized = parsed.toString();
        if (normalized.endsWith("/") && parsed.pathname !== "/") {
            normalized = normalized.slice(0, -1);
        }
        // Also remove trailing slash from root domain for consistency
        if (normalized.endsWith("/")) {
            normalized = normalized.slice(0, -1);
        }

        return normalized;
    } catch {
        return null;
    }
};

/**
 * Removes URLs from text.
 * @param input
 * @returns
 */
const removeUrlsFromText = (input: string | undefined): string | undefined => {
    if (!input) {
        return input;
    }

    const urlLikePatterns: Array<RegExp> = [
        /\bhttps?:\/\/[^\s)]+/gi, // http/https URLs
        /\bwww\.[^\s)]+/gi, // www. URLs
        /\[[^\]]+]\([^)]*\)/gi, // markdown links [text](url)
        /\b[a-z0-9-]+(\.[a-z0-9-]+)+[^\s)"]*/gi, // bare domains like smashingmagazine.com/foo
    ];

    let output = input;

    urlLikePatterns.forEach((pattern) => {
        output = output.replace(pattern, "");
    });

    // Clean up spacing / empty parentheses
    output = output.replace(/\s{2,}/g, " ").trim();
    output = output.replace(/\(\s*\)/g, "").trim();

    return output;
};

export { normalizeUrl, removeUrlsFromText };
