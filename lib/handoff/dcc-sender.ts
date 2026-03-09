import crypto from "crypto";
import type { DccToWtaIntentV1 } from "@/lib/handoff/dcc";

/**
 * Copy this helper into DCC (or import it from a shared package) to build WTA handoff links.
 */
export function createSignedDccIntentPayload(intent: DccToWtaIntentV1, secret: string) {
  const payload = Buffer.from(JSON.stringify(intent), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return { payload, sig };
}

export function buildWtaHandoffUrlFromIntent(options: {
  wtaOrigin: string;
  intent: DccToWtaIntentV1;
  secret?: string;
}) {
  const url = new URL("/handoff/dcc", options.wtaOrigin);

  const payload = Buffer.from(JSON.stringify(options.intent), "utf8").toString("base64url");
  url.searchParams.set("payload", payload);

  if (options.secret) {
    const sig = crypto.createHmac("sha256", options.secret).update(payload).digest("hex");
    url.searchParams.set("sig", sig);
  }

  return url.toString();
}

export function buildWtaHandoffUrlFromId(options: {
  wtaOrigin: string;
  handoffId: string;
}) {
  const url = new URL("/handoff/dcc", options.wtaOrigin);
  url.searchParams.set("id", options.handoffId);
  return url.toString();
}
