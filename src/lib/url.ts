/**
 * Normalizes a URL by removing query params and hash.
 * @param url
 * @returns The normalized URL or null if the URL is invalid.
 */
export function normalizeUrl(url: string): string | null {
    try {
        const value = url.trim();

        const parsed = new URL(
            value.startsWith("http") ? value : `https://${value}`,
        );

        parsed.hash = "";
        parsed.searchParams.forEach((value, key) => {
            parsed.searchParams.delete(key);
        });

        return parsed.toString();
    } catch {
        return null;
    }
}
