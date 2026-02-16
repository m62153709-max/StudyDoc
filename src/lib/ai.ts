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

export type AIPaperSummary = {
  title: string;
  authors: string[];
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
