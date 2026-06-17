// src/lib/pdf.ts
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { createWorker } from "tesseract.js";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MIN_TEXT_THRESHOLD = 100;
const OCR_MAX_PAGES = 40;
const OCR_SCALE = 2.0;

export async function extractTextFromPdf(
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  const data = await file.arrayBuffer();
  const loadingTask = (pdfjsLib as any).getDocument({ data });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items as any[])
      .map((item) => ("str" in item ? (item.str as string) : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }

  if (fullText.trim().length >= MIN_TEXT_THRESHOLD) {
    return fullText;
  }

  // Fall back to OCR for scanned PDFs
  onProgress?.("Scanned PDF detected — running OCR. This may take 1–2 minutes...");
  return ocrPdf(pdf, onProgress);
}

async function ocrPdf(pdf: any, onProgress?: (msg: string) => void): Promise<string> {
  const worker = await createWorker("eng", 1, {
    logger: () => {},
  });

  const pagesToProcess = Math.min(pdf.numPages, OCR_MAX_PAGES);
  let fullText = "";

  for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
    onProgress?.(`OCR: reading page ${pageNum} of ${pagesToProcess}...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: OCR_SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const { data: { text } } = await worker.recognize(canvas);
    fullText += text + "\n\n";
  }

  await worker.terminate();

  if (pagesToProcess < pdf.numPages) {
    fullText += `\n\n[OCR processed first ${pagesToProcess} of ${pdf.numPages} pages.]`;
  }

  return fullText;
}
