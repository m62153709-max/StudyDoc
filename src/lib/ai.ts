// src/lib/ai.ts
// Client-side AI helpers (NO SECRETS HERE).
// All OpenAI / AI Gateway calls must go through /api/ai so keys never reach the browser.

export type SectionSummary = {
  label: string;
  beginner: string;
  intermediate: string;
  expert: string;
};

export type ResearchDetails = {
  research_question: string;
  domain: string;
  methodology: string;
  data: string;
  key_results: string;
  limitations: string;
  future_work: string;
};

export type PaperMetadata = {
  year?: string;
  journal?: string;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  url?: string;
};

export type AIPaperSummary = {
  title: string;
  authors: string[];
  metadata?: PaperMetadata;
  abstract: {
    beginner: string;
    intermediate: string;
    expert: string;
  };
  sections: SectionSummary[];
  research_details: ResearchDetails;
  key_takeaways: string[];
  quiz: {
    question: string;
    options: string[];
    answer_index: number;
    explanation: string;
  }[];
};

export type TutorLevel = "beginner" | "intermediate" | "expert";

export type AIDiagram = {
  title: string;
  description: string;
  steps: {
    label: string;
    detail: string;
  }[];
};

type AIAction = "summarize" | "tutor" | "diagram" | "embed";

async function callAI<T>(action: AIAction, payload: Record<string, any>): Promise<T> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[StudyDoc] /api/ai error:", res.status, res.statusText, errText);
    throw new Error("AI request failed");
  }

  return (await res.json()) as T;
}

export async function summarizePaperWithAI(paperText: string): Promise<AIPaperSummary> {
  return callAI<AIPaperSummary>("summarize", { paperText });
}

export async function answerQuestionAboutPaper(
  paperText: string,
  question: string,
  level: TutorLevel
): Promise<string> {
  const out = await callAI<{ answer: string }>("tutor", { paperText, question, level });
  return out.answer;
}

export async function generateDiagramForPaper(
  paperText: string,
  level: TutorLevel
): Promise<AIDiagram> {
  return callAI<AIDiagram>("diagram", { paperText, level });
}

export async function embedTextForSearch(text: string): Promise<number[]> {
  const out = await callAI<{ embedding: number[] }>("embed", { text });
  return out.embedding;
}

export type PaperComparison = {
  summary: string;
  research_question: { paper1: string; paper2: string; verdict: string };
  methodology: { paper1: string; paper2: string; verdict: string };
  findings: { paper1: string; paper2: string; verdict: string };
  scope: { paper1: string; paper2: string; verdict: string };
  agreements: string[];
  disagreements: string[];
  recommendation: string;
};

export async function comparePapers(text1: string, text2: string): Promise<PaperComparison> {
  return callAI<PaperComparison>("compare", { text1, text2 });
}
