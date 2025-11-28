import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { LinkGetPayload } from "@/__generated/prisma/models/Link";

type LinkWithTags = LinkGetPayload<{
    include: {
        tags: {
            include: {
                tag: true;
            };
        };
    };
}>;

const formatMonthString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

/**
 * TODO: Can we use AI and the tags to generate a better subject?
 * TODO: We should also include which edition number this is.
 */
const generateDefaultSubject = (linksCount: number, month: string): string => {
    const [year, monthNum] = month.split("-");
    const monthName = new Date(
        parseInt(year, 10),
        parseInt(monthNum, 10) - 1,
    ).toLocaleString("en-US", { month: "long" });

    return `${monthName} ${year} Newsletter - ${linksCount} curated links`;
};

const generateDefaultIntroduction = (
    linksCount: number,
    links: Array<LinkWithTags>,
): string => {
    const tagCounts = new Map<string, number>();

    for (const link of links) {
        for (const linkTag of link.tags) {
            const label = linkTag.tag.label;
            tagCounts.set(label, (tagCounts.get(label) ?? 0) + 1);
        }
    }

    const topTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label]) => label);

    const tagText = topTags.length > 0 ? ` covering ${topTags.join(", ")}` : "";

    return `This month's newsletter features ${linksCount} carefully curated links${tagText}. Our team has handpicked these resources to help you stay up to date with the latest insights and inspiration.`;
};

const createNewsletterEntryInDatabase = async (links: Array<LinkWithTags>) => {
    "use step";

    const now = new Date();
    const month = formatMonthString(now);

    const existingNewsletter = await prisma.newsletter.findUnique({
        where: { month },
        include: {
            links: {
                include: {
                    link: true,
                },
            },
        },
    });

    if (existingNewsletter) {
        return { newsletter: existingNewsletter, alreadyExists: true };
    }

    const subject = generateDefaultSubject(links.length, month);
    const introductionText = generateDefaultIntroduction(links.length, links);

    const newsletter = await prisma.newsletter.create({
        data: {
            month,
            subject,
            introductionText,
            links: {
                create: links.map((link, index) => ({
                    linkId: link.id,
                    position: index,
                })),
            },
        },
        include: {
            links: {
                include: {
                    link: true,
                },
            },
        },
    });

    return { newsletter, alreadyExists: false };
};

export { createNewsletterEntryInDatabase };
export type { LinkWithTags };
