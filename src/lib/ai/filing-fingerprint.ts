import { createHash } from "node:crypto";

export function buildFilingFingerprint(
  ticker: string,
  parts: {
    accessionNumber: string;
    viewUrl: string;
    filingDate: string;
    form: string;
  }
): string {
  const raw = `${ticker.toUpperCase()}|${parts.accessionNumber || parts.viewUrl}|${parts.filingDate}|${parts.form}`;
  return createHash("sha256").update(raw).digest("hex");
}
