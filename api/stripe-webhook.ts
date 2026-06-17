// api/stripe-webhook.ts
// Vercel serverless function — receives Stripe webhook events.
// Verifies the Stripe signature, then upgrades the user in Supabase
// when a checkout.session.completed event arrives.

import { createClient } from "@supabase/supabase-js";
import type { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Read the raw body as a Buffer (required for Stripe signature verification).
function rawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// Minimal Stripe webhook signature verification (no stripe npm package needed).
function verifyStripeSignature(
  payload: Buffer,
  header: string,
  secret: string
): boolean {
  const parts: Record<string, string> = {};
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    parts[k] = v;
  }
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;

  const signed = `${timestamp}.${payload.toString("utf8")}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.writeHead(405).end("Method Not Allowed");
    return;
  }

  const body = await rawBody(req);
  const stripeHeader = (req.headers["stripe-signature"] as string) ?? "";

  if (!verifyStripeSignature(body, stripeHeader, STRIPE_WEBHOOK_SECRET)) {
    console.error("Stripe signature verification failed");
    res.writeHead(400).end("Bad signature");
    return;
  }

  let event: any;
  try {
    event = JSON.parse(body.toString("utf8"));
  } catch {
    res.writeHead(400).end("Invalid JSON");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Stripe passes the Supabase user ID in client_reference_id.
    // We set this when building the checkout URL (see handleUpgradeToPro).
    const userId: string | null = session.client_reference_id ?? null;
    const customerEmail: string | null = session.customer_details?.email ?? null;

    if (!userId) {
      // No user ID — we can't upgrade anyone. Log and return 200 so Stripe
      // doesn't keep retrying (this would happen for anonymous purchases).
      console.warn("checkout.session.completed with no client_reference_id", {
        sessionId: session.id,
        customerEmail,
      });
      res.writeHead(200).end("ok");
      return;
    }

    // Use the service-role key to bypass RLS and update the profile.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          plan: "pro",
          stripe_customer_id: session.customer ?? null,
          stripe_session_id: session.id,
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Failed to upgrade user to pro", { userId, error });
      res.writeHead(500).end("DB error");
      return;
    }

    console.log("Upgraded user to pro", { userId, sessionId: session.id });
  }

  // Always return 200 for unhandled event types so Stripe stops retrying.
  res.writeHead(200).end("ok");
}

export const config = {
  api: {
    bodyParser: false, // must be disabled — we verify the raw body
  },
};
