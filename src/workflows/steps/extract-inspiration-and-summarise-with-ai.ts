import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { ExtractedInspirationFromUrlSchema } from "@/lib/zod/extracted-inpsiration-from-url";

const fetchDocumentAsHTMLAndExtractDocumentMetadata = async (
    url: string,
): Promise<{
    title: string;
    image: string | null;
}> => {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "OpenGraph",
            "Cache-Control": "no-cache",
            Accept: "*/*",
            Connection: "keep-alive",
        },
    });

    const html = await response.text();

    const tagTitle = html.match(/<title>(.*?)<\/title>/)?.[1];

    const tagImage = html.match(
        /<meta property="og:image" content="(.*?)"/,
    )?.[1];

    const tagTwitterImage = html.match(
        /<meta name="twitter:image" content="(.*?)"/,
    )?.[1];

    const result = {
        title: tagTitle ?? "",
        image: tagImage ?? tagTwitterImage ?? null,
    };

    return result;
};

const extractInspiration = async (
    url: string,
): Promise<z.infer<typeof ExtractedInspirationFromUrlSchema>> => {
    "use step";

    const inspirationTagFromDatabase = await prisma.tag.findUnique({
        where: {
            key: "inspiration",
        },
    });

    if (!inspirationTagFromDatabase) {
        throw new Error("Inspiration tag not found");
    }

    const documentMetadata =
        await fetchDocumentAsHTMLAndExtractDocumentMetadata(url);

    const validatedObject = ExtractedInspirationFromUrlSchema.safeParse({
        headline: documentMetadata.title,
        thumbnail: documentMetadata.image,
        source: url,
        tags: [inspirationTagFromDatabase.key],
    });

    if (!validatedObject.success) {
        throw new Error("Invalid extracted data", {
            cause: validatedObject.error,
        });
    }

    return validatedObject.data;
};

export { extractInspiration };
