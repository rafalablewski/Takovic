/**
 * Re-exports for callers that imported registry-style APIs.
 * All covered tickers share one agnostic template; context comes from the registry + data modules.
 */

export { buildCoveragePromptForTicker } from "./build-coverage-prompt";
