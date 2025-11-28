import { NextResponse, type NextRequest } from "next/server";
import { generateNewsletterWorkflow } from "@/workflows/generate-newsletter";
import { start } from "workflow/api";

const isLastFridayOfMonth = (date: Date): boolean => {
    const dayOfWeek = date.getDay();

    // Check if it's a Friday (5)
    if (dayOfWeek !== 5) {
        return false;
    }

    // Get the last day of the current month
    const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
    ).getDate();

    // Check if there's another Friday left in this month
    const currentDay = date.getDate();
    const daysUntilNextFriday = 7;

    return currentDay + daysUntilNextFriday > lastDayOfMonth;
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const skipValidation = searchParams.get("skipValidation") === "true";

    const now = new Date();

    if (!skipValidation && !isLastFridayOfMonth(now)) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Not the last Friday of the month. Skipping newsletter generation.",
                isLastFriday: false,
                currentDate: now.toISOString(),
            },
            { status: 200 },
        );
    }

    try {
        await start(generateNewsletterWorkflow, []);

        return new Response("Newsletter generation started successfully", {
            status: 200,
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error generating newsletter:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate newsletter",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
