/**
 * Per-ticker coverage analyst prompts (dedicated prompt text + dynamic slices from data).
 */

export type CoveragePromptBuilder = () => Promise<string | null>;
