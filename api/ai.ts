// api/ai.ts
// Vercel Serverless Function (Node).
// Keeps secrets on the server. Frontend calls POST /api/ai.
// Uses Vercel AI Gateway (OpenAI-compatible) by default.

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

// Keep your provider/model choice on the server so you can swap later.
const DEFAULT_CHAT_MODEL = "openai/gpt-4o-mini"; // change if desired, e.g. "openai/gpt-4.1"
const DEFAULT_EMBED_MODEL = "openai/text-embedding-3-small";

/**
 * Read JSON body from Vercel's req (works for Node serverless).
 */
async function readJson(req: any) {
  return new Promise<any>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function json(res: any, status: number, body: any) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function text(res: any, status: number, body: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);
}

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} (set it in Vercel env vars)`);
  return String(v).trim();
}

async function gatewayFetch(path: string, payload: any) {
  const apiKey = requireEnv("AI_GATEWAY_API_KEY");

  const r = await fetch(`${AI_GATEWAY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      // Optional but nice for Vercel analytics/debugging:
      "x-title": "StudyDoc",
    },
    body: JSON.stringify(payload),
  });

  const txt = await r.text();
  if (!r.ok) {
    throw new Error(`AI Gateway error ${r.status} ${r.statusText}: ${txt}`);
  }
  return txt ? JSON.parse(txt) : {};
}

function clampText(s: string, maxChars: number) {
  if (!s) return "";
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}

// Prompts kept server-side so you can iterate without shipping them to clients.
function buildSummarySystemPrompt() {
  return `
You are an expert educator. The user will give you the full text of an academic paper.

Your job is to produce a structured, multi-level summary of the ENTIRE paper, not just the abstract.

You MUST return ONLY valid JSON matching this TypeScript type exactly:

{
  "title": string,
  "authors": string[],
  "abstract": {
    "beginner": string,
    "intermediate": string,
    "expert": string
  },
  "sections": {
    "label": string,
    "beginner": string,
    "intermediate": string,
    "expert": string
  }[],
  "research_details": {
    "research_question": string,
    "domain": string,
    "methodology": string,
    "data": string,
    "key_results": string,
    "limitations": string,
    "future_work": string
  },
  "key_takeaways": string[],
  "quiz": {
    "question": string,
    "options": string[],
    "answer_index": number,
    "explanation": string
  }[]
}

Guidelines:

- "title": clear, human-readable title. If unsure, infer a concise one.
- "authors": list of author names. If you cannot find them, return ["Unknown"].

- "abstract":
  - "beginner": 2–4 sentences explaining the whole paper to a bright high school student; avoid heavy jargon.
  - "intermediate": 3–6 sentences for an undergraduate in the field; use real terminology but stay clear.
  - "expert": 1–2 concise paragraphs for a graduate-level reader; focus on contributions, methods, and results.

- "sections":
  - Each section should correspond to a major part of the paper such as:
    "Background" or "Introduction",
    "Methods", "Experiments", "Results",
    "Analysis", "Discussion", "Conclusion",
    or any other named sections that actually appear.
  - 4–8 sections is ideal.

- "research_details":
  - Fill all fields.

- "key_takeaways": 5–10 bullets.

- "quiz": 3–5 multiple choice questions.

Do NOT include citations, reference numbers like [1] or [12], or LaTeX markup.
Return ONLY JSON, with no backticks, no markdown, and no commentary.
`;
}

function buildTutorSystemPrompt(level: string) {
  const levelInstruction =
    level === "beginner"
      ? "Explain this as if to a bright high school student. Avoid jargon, use analogies."
      : level === "intermediate"
      ? "Explain this to an undergraduate in the field. Use real terminology but keep things clear."
      : "Explain this to a graduate-level researcher. You may assume familiarity with technical concepts.";

  return `
You are a helpful tutor answering questions ONLY using the content of the provided academic paper.

Rules:
- Do NOT invent facts that are not supported by the paper.
- If the paper does not contain enough information to answer, say so clearly.
- Keep answers concise, structured, and focused.
- Adapt your explanation to the requested difficulty.

${levelInstruction}
`;
}

function buildDiagramSystemPrompt() {
  return `
You are an expert instructional designer.

Given text from an academic paper, you will build a simple CONCEPT DIAGRAM as a sequence of labeled steps showing how the main ideas connect.

Return ONLY valid JSON in this exact TypeScript type:

{
  "title": string,
  "description": string,
  "steps": {
    "label": string,
    "detail": string
  }[]
}
`;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return text(res, 405, "Method Not Allowed");
    }

    const body = await readJson(req);
    const action = body.action as string;

    if (!action) return json(res, 400, { error: "Missing action" });

    // Guardrails to keep payload sizes sane in serverless.
    // (You can bump these later if needed.)
    const paperText = clampText(String(body.paperText || ""), 120_000); // ~120k chars
    const question = clampText(String(body.question || ""), 5_000);
    const level = String(body.level || "intermediate");
    const textInput = clampText(String(body.text || ""), 50_000);

    if (action === "summarize") {
      if (!paperText) return json(res, 400, { error: "Missing paperText" });

      const systemPrompt = buildSummarySystemPrompt();
      const userPrompt = `Here is the full text of the paper.\n\nPAPER TEXT START\n----------------\n${paperText}\n----------------\nPAPER TEXT END`;

      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");
      return json(res, 200, JSON.parse(content));
    }

    if (action === "tutor") {
      if (!paperText || !question) return json(res, 400, { error: "Missing paperText or question" });

      const systemPrompt = buildTutorSystemPrompt(level);
      const userPrompt = `PAPER TEXT START\n----------------\n${paperText}\n----------------\nPAPER TEXT END\n\nQUESTION:\n${question}`;

      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");
      return json(res, 200, { answer: String(content).trim() });
    }

    if (action === "diagram") {
      if (!paperText) return json(res, 400, { error: "Missing paperText" });

      const systemPrompt = buildDiagramSystemPrompt();
      const userPrompt = `Build a concept diagram from this paper. Audience level: ${level}\n\nPAPER TEXT START\n----------------\n${paperText}\n----------------\nPAPER TEXT END`;

      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");
      return json(res, 200, JSON.parse(content));
    }

    if (action === "embed") {
      if (!textInput) return json(res, 400, { error: "Missing text" });

      // OpenAI-compatible embeddings endpoint
      const data = await gatewayFetch("/embeddings", {
        model: DEFAULT_EMBED_MODEL,
        input: textInput.length > 8000 ? textInput.slice(0, 8000) : textInput,
      });

      const embedding = data?.data?.[0]?.embedding;
      if (!embedding) throw new Error("Empty embedding response");
      return json(res, 200, { embedding });
    }

    return json(res, 400, { error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error("[StudyDoc] /api/ai error:", err?.message || err);
    return json(res, 500, { error: err?.message || "Server error" });
  }
}
