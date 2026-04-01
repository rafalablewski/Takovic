/**
 * Client-safe dynamic import for `src/data/coverage/<ticker>.ts` entry modules.
 */

export function importCoverageTickerModule(lowerTicker: string): Promise<Record<string, unknown>> {
  return import(`@/data/coverage/${lowerTicker}`) as Promise<Record<string, unknown>>;
}
