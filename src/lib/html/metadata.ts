type Metadata = {
    title?: string;
    description?: string;
};

const TITLE_REGEX = /<title[^>]*>(.*?)<\/title>/is;

const META_REGEX = /<meta\s+[^>]*(name|property)\s*=\s*["']([^"']+)["'][^>]*>/gi;

const META_CONTENT_REGEX = /content\s*=\s*["']([^"']+)["']/i;

const TARGET_META_KEYS = ["description", "og:description", "twitter:description"];
const TARGET_TITLE_KEYS = ["og:title", "twitter:title"];

function decodeHtmlEntities(value: string) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function extractTitle(html: string): string | undefined {
    const match = html.match(TITLE_REGEX);
    if (match?.[1]) {
        return decodeHtmlEntities(match[1].trim());
    }

    for (const key of TARGET_TITLE_KEYS) {
        const value = extractMetaByKey(html, key);
        if (value) {
            return value;
        }
    }

    return undefined;
}

function extractMetaByKey(html: string, key: string): string | undefined {
    META_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = META_REGEX.exec(html))) {
        const attrName = match[1].toLowerCase();
        const attrValue = match[2].toLowerCase();

        if (attrValue !== key.toLowerCase()) {
            continue;
        }

        const contentMatch = match[0].match(META_CONTENT_REGEX);
        if (contentMatch?.[1]) {
            return decodeHtmlEntities(contentMatch[1].trim());
        }
    }

    return undefined;
}

function extractDescription(html: string): string | undefined {
    for (const key of TARGET_META_KEYS) {
        const value = extractMetaByKey(html, key);
        if (value) {
            return value;
        }
    }

    return undefined;
}

export function parseHtmlMetadata(html: string): Metadata {
    const title = extractTitle(html);
    const description = extractDescription(html);
    return { title, description };
}

