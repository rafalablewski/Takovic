/**
 * Fetch SEC filing primary document HTML/text for AI analysis.
 * SEC expects a descriptive User-Agent (same convention as EDGAR JSON).
 */

const USER_AGENT =
  process.env.EDGAR_USER_AGENT || "Takovic admin@takovic.com";

/** Max characters passed to the model (filings can be huge). */
export const SEC_DOCUMENT_MAX_CHARS = Number(
  process.env.FILING_AI_MAX_CHARS || 100_000
);

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchFilingDocumentText(url: string): Promise<{
  text: string;
  truncated: boolean;
}> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid document URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Invalid document URL");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,text/plain,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Document fetch failed (${response.status})`);
    }

    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    const text = contentType.includes("html")
      ? stripHtml(raw)
      : raw.replace(/\s+/g, " ").trim();

    if (text.length > SEC_DOCUMENT_MAX_CHARS) {
      return {
        text: text.slice(0, SEC_DOCUMENT_MAX_CHARS),
        truncated: true,
      };
    }
    return { text, truncated: false };
  } finally {
    clearTimeout(timeout);
  }
}
