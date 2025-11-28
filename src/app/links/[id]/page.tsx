import { Heading, List, ListItem, Paragraph } from "@/components/ui/typography";
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";

type LinkPageProps = {
    params: Promise<{ id: string }>;
};

const LinkPage = async ({ params }: LinkPageProps) => {
    const { id } = await params;

    const link = await prisma.link.findUnique({
        where: { id },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    if (!link) {
        return notFound();
    }

    const { headline, summary, tags, ...rest } = link;

    return (
        <div>
            <Heading size="h1">{link?.headline}</Heading>
            <Paragraph>{link?.summary}</Paragraph>
            <List>
                {link?.tags.map((tag) => (
                    <ListItem key={tag.tag.key}>{tag.tag.label}</ListItem>
                ))}
            </List>
            <pre>{JSON.stringify(rest, null, 2)}</pre>
        </div>
    );
};

export default LinkPage;
