import { createHash } from "node:crypto";
import { filingDedupeKey } from "@/lib/ai/filing-dedupe-key";

export { filingDedupeKey } from "@/lib/ai/filing-dedupe-key";

export function buildFilingFingerprint(
  ticker: string,
  parts: {
    accessionNumber: string;
    viewUrl: string;
    filingDate: string;
    form: string;
  }
): string {
  return createHash("sha256")
    .update(filingDedupeKey(ticker, parts))
    .digest("hex");
}
