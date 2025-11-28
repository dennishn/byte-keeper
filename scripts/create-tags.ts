import { PrismaClient } from "../src/__generated/prisma/client";
import dotenv from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";

dotenv.config({ path: ".env.local" });

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const INITIAL_TAGS = [
    { key: "svelte", label: "Svelte" },
    { key: "nextjs", label: "Next.js" },
    { key: "astro", label: "Astro" },
    { key: "remix", label: "Remix" },
    { key: "react", label: "React" },
    { key: "web-components", label: "Web Components" },
    { key: "css", label: "CSS" },
    { key: "tailwind", label: "Tailwind" },
    { key: "design-systems", label: "Design Systems" },
    { key: "component-libraries", label: "Component Libraries" },
    { key: "ui-ux", label: "UI/UX" },
    { key: "gsap", label: "GSAP" },
    { key: "animation", label: "Animation" },
    { key: "3d", label: "3D" },
    { key: "tooling", label: "Tooling" },
    { key: "javascript-typescript", label: "JavaScript / TypeScript" },
    { key: "web-performance", label: "Web Performance" },
    { key: "libraries", label: "Libraries" },
    { key: "ai-ml", label: "AI & ML" },
    { key: "cms", label: "CMS" },
    { key: "testing", label: "Testing" },
    { key: "storybook", label: "Storybook" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "vercel-ai-sdk", label: "Vercel AI SDK" },
    { key: "vercel-workflow-devkit", label: "Vercel Workflow DevKit" },
    { key: "baseline", label: "Baseline" },
    { key: "inspiration", label: "Inspiration" },
];

async function main() {
    for (const tag of INITIAL_TAGS) {
        await prisma.tag.upsert({
            where: {
                key: tag.key,
            },
            update: {
                key: tag.key,
                label: tag.label,
            },
            create: {
                key: tag.key,
                label: tag.label,
            },
        });
    }
}

main().catch((error) => {
    console.error("Failed to create tags", error);
    process.exitCode = 1;
});
