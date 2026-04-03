/**
 * Fetch SEC filing primary document HTML/text for AI analysis.
 * SEC expects a descriptive User-Agent (same convention as EDGAR JSON).
 *
 * Limits memory: rejects huge Content-Length and streams the body with a byte cap.
 */

const USER_AGENT =
  process.env.EDGAR_USER_AGENT || "Takovic admin@takovic.com";

/** Max characters passed to the model (filings can be huge). */
export const SEC_DOCUMENT_MAX_CHARS = Number(
  process.env.FILING_AI_MAX_CHARS || 100_000
);

/**
 * Max raw bytes read from the network (before HTML strip).
 * Default 8MB — enough for ~100k+ chars of text; avoids OOM on 100MB+ filings.
 */
export const SEC_DOCUMENT_MAX_FETCH_BYTES = Number(
  process.env.FILING_AI_MAX_FETCH_BYTES || 8_000_000
);

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function readBodyWithByteCap(
  response: Response,
  maxBytes: number
): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) {
    const t = await response.text();
    const enc = new TextEncoder();
    const full = enc.encode(t);
    return full.byteLength <= maxBytes
      ? full
      : full.slice(0, maxBytes);
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value?.length) continue;
      const remaining = maxBytes - total;
      if (remaining <= 0) {
        await reader.cancel().catch(() => {});
        break;
      }
      if (value.length <= remaining) {
        chunks.push(value);
        total += value.length;
      } else {
        chunks.push(value.slice(0, remaining));
        total = maxBytes;
        await reader.cancel().catch(() => {});
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
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
  const maxBytes = SEC_DOCUMENT_MAX_FETCH_BYTES;

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

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const n = Number(contentLength);
      if (Number.isFinite(n) && n > maxBytes) {
        throw new Error(
          `Document too large to fetch safely (${n} bytes; max ${maxBytes})`
        );
      }
    }

    const contentType = response.headers.get("content-type") || "";
    const bytes = await readBodyWithByteCap(response, maxBytes);
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const hitByteCap = bytes.byteLength >= maxBytes;

    const text = contentType.includes("html")
      ? stripHtml(raw)
      : raw.replace(/\s+/g, " ").trim();

    if (text.length > SEC_DOCUMENT_MAX_CHARS) {
      return {
        text: text.slice(0, SEC_DOCUMENT_MAX_CHARS),
        truncated: true,
      };
    }
    return { text, truncated: hitByteCap };
  } finally {
    clearTimeout(timeout);
  }
}
