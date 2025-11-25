import type { Prisma } from "@/__generated/prisma/client";

type NewsletterTemplateProps = Prisma.NewsletterGetPayload<{
    select: {
        introductionText: true;
        links: {
            select: {
                link: {
                    select: {
                        headline: true;
                        summary: true;
                        url: true;
                        tags: true;
                        sharedAt: true;
                        sharedByDisplayName: true;
                    };
                };
            };
        };
    };
}>;

const NewsletterTemplate = ({
    introductionText,
    links,
}: NewsletterTemplateProps) => {
    return (
        <div>
            <p>{introductionText}</p>
            <ul>
                {links.map((link) => (
                    <li key={link.link.url}>{link.link.headline}</li>
                ))}
            </ul>
        </div>
    );
};

NewsletterTemplate.displayName = "NewsletterTemplate";

export { NewsletterTemplate };
