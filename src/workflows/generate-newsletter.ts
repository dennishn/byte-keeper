import "server-only";
import { gatherLinksFromLastMonth } from "./steps/gather-links-from-last-month";
import { createNewsletterEntryInDatabase } from "./steps/create-newsletter-entry-in-database";
import { messageAboutNewsletterReady } from "./steps/message-user";

export async function generateNewsletterWorkflow() {
    "use workflow";

    globalThis.fetch = fetch;

    // Step 1: Gather all links from the last month
    const { links } = await gatherLinksFromLastMonth();

    if (links.length === 0) {
        console.log(
            "No links found from the last month. Skipping newsletter generation.",
        );
        return;
    }

    // Step 2: Create newsletter entry in the database
    const { newsletter, alreadyExists } =
        await createNewsletterEntryInDatabase(links);

    if (alreadyExists) {
        console.log(
            `Newsletter for ${newsletter.month} already exists. Skipping creation.`,
        );
        return;
    }

    // Step 3: Send Slack notification about the newsletter being ready
    await messageAboutNewsletterReady(newsletter);
}
