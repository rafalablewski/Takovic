"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function CopyCoveragePromptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0"
      disabled={!text}
      onClick={handleCopy}
      aria-label={copied ? "Prompt copied" : "Copy coverage analyst prompt to clipboard"}
    >
      {copied ? (
        <Check className="text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy />
      )}
      {copied ? "Copied" : "Copy prompt"}
    </Button>
  );
}
