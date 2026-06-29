// api/send-welcome-email.ts
// Called client-side on first login. Sends a welcome email via Resend.
// Marks welcome_email_sent = true in profiles so it only fires once.

import { createClient } from "@supabase/supabase-js";
import type { IncomingMessage, ServerResponse } from "http";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FROM_EMAIL = "StudyDoc <hello@studydoc.app>";

async function readJson(req: IncomingMessage) {
  return new Promise<any>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => { try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON")); } });
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") { res.writeHead(405).end(); return; }

  const { userId, email } = await readJson(req);
  if (!userId || !email) { res.writeHead(400).end("Missing userId or email"); return; }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Check if already sent
  const { data: profile } = await supabase
    .from("profiles")
    .select("welcome_email_sent")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.welcome_email_sent) {
    res.writeHead(200).end("already_sent");
    return;
  }

  // Send welcome email via Resend
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to StudyDoc — here's what most people miss",
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1c1917; padding: 32px 24px;">
          <p style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c; margin-bottom: 24px;">StudyDoc</p>

          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; line-height: 1.3;">
            You uploaded your first paper. Here's what to do next.
          </h1>

          <p style="color: #57534e; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            Most people read the summary and close the tab. That's fine — but StudyDoc can do a lot more, and the features that actually stick tend to be the ones nobody finds on their own.
          </p>

          <p style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">Try Tutor Mode</p>
          <p style="color: #57534e; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            Open any paper, click the <strong>Tutor</strong> tab, and ask a question like <em>"What's the main weakness in their methodology?"</em> or <em>"Explain the results in plain English."</em> Every answer is grounded in the paper — no hallucinations, no generic AI filler.
          </p>

          <p style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">Take the quiz</p>
          <p style="color: #57534e; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            The <strong>Quiz</strong> tab generates multiple-choice questions from the paper. If you can answer them, you understood it. If you can't, you know exactly what to re-read. Takes 3 minutes and actually works.
          </p>

          <p style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">Save quotes as you read</p>
          <p style="color: #57534e; font-size: 15px; line-height: 1.7; margin-bottom: 20px;">
            Highlight any text in the summary to save it as a quote with the citation auto-attached. Every quote you need for your essay, one place.
          </p>

          <a href="https://studydoc.app" style="display: inline-block; background: #1c1917; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">
            Open StudyDoc →
          </a>

          <p style="color: #a8a29e; font-size: 12px; margin-top: 32px; line-height: 1.6;">
            You're receiving this because you created a StudyDoc account.<br/>
            <a href="https://studydoc.app" style="color: #a8a29e;">studydoc.app</a>
          </p>
        </div>
      `,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error("Resend error:", err);
    res.writeHead(500).end("Email send failed");
    return;
  }

  // Mark as sent
  await supabase
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", userId);

  res.writeHead(200).end("sent");
}
