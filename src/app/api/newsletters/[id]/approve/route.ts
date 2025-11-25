import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getNewsletterById, markNewsletterPublished } from "@/lib/data/newsletters";
import { resend } from "@/lib/email/resend";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

type RouteParams = {
    params: {
        id: string;
    };
};

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: RouteParams) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const newsletterId = params.id;
    if (!newsletterId) {
        return NextResponse.json({ error: "missing newsletter id" }, { status: 400 });
    }

    const newsletter = await getNewsletterById(newsletterId);
    if (!newsletter) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (newsletter.isPublished) {
        return NextResponse.json({ error: "already_published" }, { status: 409 });
    }

    const approvedBy = request.headers.get("x-approver") ?? "unknown";

    try {
        await resend.emails.send({
            from: serverEnv.EMAIL_FROM,
            to: serverEnv.EMAIL_RECIPIENT_LIST,
            subject: newsletter.subject,
            html: newsletter.htmlBody,
            text: newsletter.textBody ?? undefined,
        });

        await markNewsletterPublished(newsletterId, approvedBy);
    } catch (error) {
        logger.error("Failed to approve newsletter", { id: newsletterId, error });
        return NextResponse.json({ error: "send_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

function isAuthorized(request: NextRequest) {
    const header = request.headers.get("authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return false;
    }

    const token = header.slice("Bearer ".length);
    return token === serverEnv.ADMIN_API_TOKEN;
}

