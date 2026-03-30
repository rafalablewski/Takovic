/**
 * Parse scripts/bmnr-timeline-source.txt → src/data/coverage/bmnr-timeline-full.json
 * Run: node scripts/parse-bmnr-timeline-export.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcPath = path.join(root, "scripts/bmnr-timeline-source.txt");
const outPath = path.join(root, "src/data/coverage/bmnr-timeline-full.json");

const text = fs.readFileSync(srcPath, "utf8");
const lines = text.split(/\n/);

function topicToType(topic) {
  if (topic === "SEC Filing") return "filing";
  if (topic === "Holdings" || topic === "ETH Holdings") return "purchase";
  if (topic === "Capital") return "corporate";
  if (topic === "Product" || topic === "Staking") return "milestone";
  if (topic === "Strategy" || topic === "Financials" || topic === "Dilution" || topic === "Mining Era")
    return "corporate";
  return "corporate";
}

function parseSentiment(line) {
  const s = line.trim();
  if (s.includes("Bullish")) return "bullish";
  if (s.includes("Bearish")) return "bearish";
  return "neutral";
}

let i = 0;
while (i < lines.length && !/^\d{4}-\d{2}-\d{2}$/.test(lines[i])) i++;

const events = [];
let seq = 0;

while (i < lines.length) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lines[i])) {
    i++;
    continue;
  }
  const date = lines[i++];
  const topic = lines[i++] ?? "";
  const title = lines[i++] ?? "";
  const sentimentLine = lines[i++] ?? "";

  if (lines[i] !== "KEY CHANGES") {
    console.warn("Expected KEY CHANGES at line", i, "got", lines[i], "after", date, title.slice(0, 40));
    break;
  }
  i++;

  if (lines[i] !== "METRIC" || lines[i + 1] !== "PREVIOUS" || lines[i + 2] !== "NEW" || lines[i + 3] !== "CHANGE") {
    console.warn("Bad table header at", i, lines.slice(i, i + 4));
    break;
  }
  i += 4;

  const keyChanges = [];
  while (i < lines.length && lines[i] !== "NOTES") {
    if (lines[i] === "" && lines[i + 1] === "NOTES") {
      i++;
      break;
    }
    const metric = lines[i++] ?? "";
    const previous = lines[i++] ?? "";
    const newVal = lines[i++] ?? "";
    const change = lines[i++] ?? "";
    keyChanges.push({ metric, previous, newValue: newVal, change });
  }

  if (lines[i] !== "NOTES") {
    console.warn("Expected NOTES at", i, "date", date);
    break;
  }
  i++;

  const noteParts = [];
  while (i < lines.length && !lines[i].startsWith("Source:")) {
    noteParts.push(lines[i]);
    i++;
  }
  const notes = noteParts.join("\n").trim();
  const sourceLine = (lines[i] ?? "").replace(/^Source:\s*/, "").trim();
  i++;

  seq += 1;
  events.push({
    id: `bmnr-tl-${String(seq).padStart(3, "0")}`,
    date,
    topic,
    title,
    sentiment: parseSentiment(sentimentLine),
    sentimentLabel: sentimentLine.trim(),
    type: topicToType(topic),
    keyChanges,
    notes,
    source: sourceLine || undefined,
  });
}

fs.writeFileSync(outPath, JSON.stringify(events, null, 2), "utf8");
console.log("Wrote", events.length, "events to", outPath);
