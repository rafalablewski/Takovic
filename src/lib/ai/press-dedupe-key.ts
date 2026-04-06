export function pressDedupeKey(
  ticker: string,
  input: {
    title?: string | null;
    date?: string | null;
    url?: string | null;
    source?: string | null;
  }
): string {
  const norm = (v: string | null | undefined) =>
    (v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return [
    norm(ticker),
    norm(input.title),
    norm(input.date),
    norm(input.url),
    norm(input.source),
  ].join("|");
}

