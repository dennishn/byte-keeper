import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies that a request from Slack is authentic by checking the signature.
 * Based on: https://docs.slack.dev/authentication/verifying-requests-from-slack/
 *
 * @param signingSecret - The Slack signing secret from app settings
 * @param timestamp - The X-Slack-Request-Timestamp header value
 * @param signature - The X-Slack-Signature header value
 * @param rawBody - The raw request body as a string (before JSON parsing)
 * @returns true if the signature is valid, false otherwise
 */
export function verifySlackSignature(
    signingSecret: string,
    timestamp: string,
    signature: string,
    rawBody: string,
): boolean {
    // Check timestamp to prevent replay attacks
    const requestTimestamp = Number.parseInt(timestamp, 10);
    if (Number.isNaN(requestTimestamp)) {
        return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - requestTimestamp);

    // Reject requests older than 5 minutes
    if (timeDifference > 60 * 5) {
        return false;
    }

    // Create the signature basestring: v0:timestamp:body
    const sigBasestring = `v0:${timestamp}:${rawBody}`;

    // Compute the signature using HMAC SHA-256
    const hmac = createHmac("sha256", signingSecret);
    hmac.update(sigBasestring);
    const computedSignature = `v0=${hmac.digest("hex")}`;

    // Use constant-time comparison to prevent timing attacks
    if (computedSignature.length !== signature.length) {
        return false;
    }

    try {
        return timingSafeEqual(
            Buffer.from(computedSignature),
            Buffer.from(signature),
        );
    } catch {
        return false;
    }
}
