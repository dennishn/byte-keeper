import "server-only";
import { prisma } from "@/lib/prisma/client";

const checkExistingUrls = async (urls: Array<string>) => {
    "use step";

    const existingLinks = await prisma.link.findMany({
        where: { url: { in: urls } },
    });

    return existingLinks;
};

export { checkExistingUrls };
