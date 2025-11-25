import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { generateMonthlyNewsletter } from "@/workflows/monthly-newsletter";

const payloadSchema = z.object({
    targetMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let targetMonth: string | undefined;
    try {
        const json = await request.json().catch(() => ({}));
        ({ targetMonth } = payloadSchema.parse(json));
    } catch (error) {
        logger.warn("Invalid generate payload", { error });
        return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    let targetDate: Date | undefined;
    if (targetMonth) {
        targetDate = new Date(`${targetMonth}-01T00:00:00Z`);
    }

    const newsletter = await generateMonthlyNewsletter({ targetDate });

    if (!newsletter) {
        return NextResponse.json({ ok: true, message: "No links available for that month." });
    }

    return NextResponse.json({ ok: true, newsletterId: newsletter.id });
}

function isAuthorized(request: NextRequest) {
    const header = request.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return false;
    }

    const token = header.slice("Bearer ".length);
    return token === serverEnv.ADMIN_API_TOKEN;
}

