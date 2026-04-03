/**
 * Stable string key for a filing row (matches server fingerprint input, no hashing).
 * Safe for client and server.
 */
export function filingDedupeKey(
  ticker: string,
  p: {
    accessionNumber: string;
    viewUrl: string;
    filingDate: string;
    form: string;
  }
): string {
  return `${ticker.toUpperCase()}|${p.accessionNumber || p.viewUrl}|${p.filingDate}|${p.form}`;
}
