import "server-only";
import { prisma } from "@/lib/prisma/client";

const gatherLinksFromLastMonth = async () => {
    "use step";

    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const links = await prisma.link.findMany({
        where: {
            createdAt: {
                gte: oneMonthAgo,
                lte: now,
            },
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return { links };
};

export { gatherLinksFromLastMonth };
