// src/lib/pdf.ts

// Import pdf.js core + the worker bundle in a Vite-friendly way
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

// Tell pdf.js where to find its worker
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Extracts plain text from every page of a PDF File
export async function extractTextFromPdf(file: File): Promise<string> {
  const data = await file.arrayBuffer();

  const loadingTask = (pdfjsLib as any).getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = (textContent.items as any[])
      .map((item) => {
        if ("str" in item) return item.str as string;
        return "";
      })
      .join(" ");

    fullText += pageText + "\n\n";
  }

  return fullText;
}
