import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { linkAgent } from "@/lib/ai/link/agent";

export async function POST(request: NextRequest) {
    const { url } = await request.json();

    const result = await linkAgent.generate({
        prompt: `
            Generate a link entry for the following URL:
            ${url}
        `,
    });

    console.log(result);
    return NextResponse.json(result);
}
