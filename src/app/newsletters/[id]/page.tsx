import { Heading, List, ListItem, Paragraph } from "@/components/ui/typography";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";

type NewsletterPageProps = {
    params: Promise<{ id: string }>;
};

const NewsletterPage = async ({ params }: NewsletterPageProps) => {
    const { id } = await params;

    const newsletter = await prisma.newsletter.findUnique({
        where: { id },
        include: {
            links: {
                include: {
                    link: {
                        include: {
                            tags: {
                                include: {
                                    tag: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!newsletter) {
        return notFound();
    }

    console.log({ newsletter });

    return (
        <div>
            <Heading size="h1">
                Subject: {newsletter.subject} (Edition{" "}
                {newsletter.editionNumber})
            </Heading>
            <Paragraph>Introduction: {newsletter.introductionText}</Paragraph>
            <Paragraph>
                Status: {newsletter.isPublished ? "Published" : "Draft"}
            </Paragraph>
            <Heading size="h2">Links</Heading>
            <List>
                {newsletter.links.map((newsletterLink) => (
                    <ListItem key={newsletterLink.link.id}>
                        {newsletterLink.link.headline} (
                        {newsletterLink.link.tags
                            .map((linkTag) => linkTag.tag.label)
                            .join(", ")}
                        ) -{" "}
                        <Link href={newsletterLink.link.url}>
                            {newsletterLink.link.url}
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default NewsletterPage;
