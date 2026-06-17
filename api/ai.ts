// api/ai.ts
// Vercel Serverless Function (Node).
// Keeps secrets on the server. Frontend calls POST /api/ai.
// Uses Vercel AI Gateway (OpenAI-compatible) by default.

const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

// Keep provider/model choice on the server so you can swap later.
const DEFAULT_CHAT_MODEL = "openai/gpt-4o-mini"; // e.g. "openai/gpt-4.1"
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

  const raw = await r.text();
  if (!r.ok) {
    throw new Error(`AI Gateway error ${r.status} ${r.statusText}: ${raw}`);
  }

  return raw ? JSON.parse(raw) : {};
}

function clampText(s: string, maxChars: number) {
  if (!s) return "";
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}

/**
 * Many models *usually* return JSON when instructed, but sometimes prepend/append
 * whitespace or stray characters. This helper tries a strict parse first, then
 * falls back to extracting the first {...} or [...] block.
 */
function safeJsonParse(maybeJson: string) {
  const s = String(maybeJson ?? "").trim();
  if (!s) throw new Error("Empty AI response");

  // 1) Strict parse
  try {
    return JSON.parse(s);
  } catch {}

  // 2) Try to extract a JSON object/array substring
  const firstObj = s.indexOf("{");
  const lastObj = s.lastIndexOf("}");
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    const sub = s.slice(firstObj, lastObj + 1);
    try {
      return JSON.parse(sub);
    } catch {}
  }

  const firstArr = s.indexOf("[");
  const lastArr = s.lastIndexOf("]");
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    const sub = s.slice(firstArr, lastArr + 1);
    try {
      return JSON.parse(sub);
    } catch {}
  }

  throw new Error("AI returned non-JSON output (failed to parse).");
}

// Prompts kept server-side so you can iterate without shipping them to clients.
function buildSummarySystemPrompt() {
  return `
You are an expert academic analyst. The user will give you the full text of an academic paper.

Your job is to produce a structured, multi-level summary of the ENTIRE paper.

You MUST return ONLY valid JSON matching this TypeScript type exactly:

{
  "title": string,
  "authors": string[],
  "metadata": {
    "year": string,
    "journal": string,
    "doi": string,
    "volume": string,
    "issue": string,
    "pages": string,
    "publisher": string,
    "url": string
  },
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

CRITICAL RULES — failure to follow these makes your output worthless:

1. NEVER write generic filler sentences. Every single sentence must contain SPECIFIC information extracted directly from this paper. Examples of FORBIDDEN generic output:
   - "The paper investigates key themes in the field."
   - "The methodology involves data collection and analysis."
   - "The findings contribute to understanding the topic."
   - "Future research is needed in this area."
   If you catch yourself writing something that could apply to ANY paper, rewrite it with specifics from THIS paper.

2. ALWAYS include specific details: exact names of models, datasets, algorithms, chemicals, species, locations, participant counts, percentages, p-values, accuracy scores, years, institutions — whatever is actually in the paper.

3. For "abstract" at each level:
   - "beginner": 3–5 sentences. Name the specific problem, what the researchers actually did, and the specific outcome. Use an analogy if helpful. Zero jargon.
   - "intermediate": 4–7 sentences. Name specific methods, datasets or participants, and quantified results. Use correct field terminology.
   - "expert": 2 dense paragraphs. State the exact research gap, specific contributions, methodology with parameters, key quantitative results, and where this advances the field.

4. For "sections": match the actual sections in the paper. Write what SPECIFICALLY happens in each — what experiment was run, what data was used, what was found. 4–8 sections.

5. For "research_details" — be precise:
   - "research_question": the actual question or hypothesis stated or implied, quoted or closely paraphrased
   - "methodology": specific method names (e.g. "randomized controlled trial", "transformer fine-tuning on BERT-base", "ethnographic interviews with 24 participants")
   - "data": specific dataset names, sample sizes, sources, time periods
   - "key_results": specific numbers, comparisons, statistical significance where present
   - "limitations": actual limitations the authors acknowledge
   - "future_work": specific next steps the authors suggest

6. For "key_takeaways": 5–8 bullets. Each must be a specific, actionable or informative insight from THIS paper — not generic academic wisdom.

7. For "quiz": 4–5 questions that test comprehension of specific content in the paper. Wrong answer options should be plausible but clearly incorrect based on the paper.

8. For "metadata": extract from the paper header, footer, or references section:
   - "year": publication year (e.g. "2023"). Use "" if not found.
   - "journal": journal or conference name. Use "" if not found.
   - "doi": DOI string. Use "" if not found.
   - "volume", "issue", "pages": from journal info. Use "" if not found.
   - "publisher": publisher name. Use "" if not found.
   - "url": any URL in the paper header. Use "" if not found.

Do NOT include citation brackets like [1] or LaTeX markup.
Return ONLY JSON — no backticks, no markdown, no commentary.
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

Return ONLY JSON, no markdown/backticks/commentary.
`;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return text(res, 405, "Method Not Allowed");
    }

    const body = await readJson(req);
    const action = String(body.action || "");

    if (!action) return json(res, 400, { error: "Missing action" });

    // Guardrails to keep payload sizes sane in serverless.
    const paperText = clampText(String(body.paperText || ""), 120_000); // ~120k chars
    const question = clampText(String(body.question || ""), 5_000);
    const level = String(body.level || "intermediate");
    const textInput = clampText(String(body.text || ""), 50_000);

    if (action === "summarize") {
      if (!paperText) return json(res, 400, { error: "Missing paperText" });

      const systemPrompt = buildSummarySystemPrompt();
      const userPrompt = `Here is the full text of the paper.\n\nPAPER TEXT START\n----------------\n${paperText}\n----------------\nPAPER TEXT END`;

      // NOTE: Do NOT send response_format here; AI Gateway rejected it in your logs.
      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      const parsed = safeJsonParse(content);
      return json(res, 200, parsed);
    }

    if (action === "tutor") {
      if (!paperText || !question) {
        return json(res, 400, { error: "Missing paperText or question" });
      }

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

      // NOTE: Do NOT send response_format here; AI Gateway rejected it in your logs.
      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      const parsed = safeJsonParse(content);
      return json(res, 200, parsed);
    }

    if (action === "embed") {
      if (!textInput) return json(res, 400, { error: "Missing text" });

      const data = await gatewayFetch("/embeddings", {
        model: DEFAULT_EMBED_MODEL,
        input: textInput.length > 8000 ? textInput.slice(0, 8000) : textInput,
      });

      const embedding = data?.data?.[0]?.embedding;
      if (!embedding) throw new Error("Empty embedding response");
      return json(res, 200, { embedding });
    }

    if (action === "compare") {
      const text1 = clampText(String(body.text1 || ""), 60_000);
      const text2 = clampText(String(body.text2 || ""), 60_000);
      if (!text1 || !text2) return json(res, 400, { error: "Missing text1 or text2" });

      const systemPrompt = `You are an expert academic analyst. Compare two research papers and return ONLY valid JSON in this exact shape:

{
  "summary": string,
  "research_question": { "paper1": string, "paper2": string, "verdict": string },
  "methodology": { "paper1": string, "paper2": string, "verdict": string },
  "findings": { "paper1": string, "paper2": string, "verdict": string },
  "scope": { "paper1": string, "paper2": string, "verdict": string },
  "agreements": string[],
  "disagreements": string[],
  "recommendation": string
}

Rules:
- Every field must contain SPECIFIC information from the papers — no generic filler.
- "verdict" fields should state which paper is stronger/broader/more rigorous on that dimension, or say they are comparable, with a reason.
- "agreements": 3–5 specific points both papers agree on.
- "disagreements": 2–4 specific points where the papers differ or contradict.
- "recommendation": one paragraph on which paper to read first and why, depending on the reader's goal.
- Return ONLY JSON, no backticks, no markdown.`;

      const userPrompt = `PAPER 1:\n${text1}\n\nPAPER 2:\n${text2}`;

      const data = await gatewayFetch("/chat/completions", {
        model: DEFAULT_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const content = data?.choices?.[0]?.message?.content;
      const parsed = safeJsonParse(content);
      return json(res, 200, parsed);
    }

    return json(res, 400, { error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error("[StudyDoc] /api/ai error:", err?.message || err);
    return json(res, 500, { error: err?.message || "Server error" });
  }
}
