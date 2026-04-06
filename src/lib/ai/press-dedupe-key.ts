function cyrb53(input: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const value = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return value.toString(36);
}

function normalizeDate(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.toLowerCase();
  return parsed.toISOString().slice(0, 10);
}

function normalizeUrl(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.hostname.toLowerCase()}${path}`.toLowerCase();
  } catch {
    return raw.toLowerCase().replace(/\?.*$/, "").replace(/\/+$/, "");
  }
}

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
  const t = norm(ticker);
  const title = norm(input.title);
  const date = normalizeDate(input.date ?? "");
  const url = normalizeUrl(input.url ?? "");
  const source = norm(input.source);
  return `${t}|${cyrb53(title)}|${cyrb53(date)}|${cyrb53(url)}|${cyrb53(source)}`;
}

