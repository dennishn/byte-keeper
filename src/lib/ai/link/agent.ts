import { Experimental_Agent as Agent, stepCountIs } from "ai";
import { createLinkEntryTool } from "./tools/create-link-entry";

const systemPrompt = `
`;

const linkAgent = new Agent({
    model: "google/gemini-2.5-flash-lite",
    system: systemPrompt,
    stopWhen: stepCountIs(3),
    tools: {
        createLinkEntry: createLinkEntryTool,
    },
});

export { linkAgent };
