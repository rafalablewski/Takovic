import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  ClipboardList,
  FileText,
  Bot,
  Terminal,
  Zap,
  GitBranch,
  Bug,
  Wrench,
  Calendar,
  Layers,
  Shield,
  BookOpen,
  Code2,
  Lightbulb,
  Target,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Tip {
  title: string;
  description: string;
  source?: string;
}

interface GuideSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  tips: Tip[];
}

const sections: GuideSection[] = [
  {
    id: "prompting",
    icon: MessageSquare,
    title: "Prompting",
    subtitle: "Talk to Claude like a senior engineer on the team",
    tips: [
      {
        title: "Challenge Claude on stock pages",
        description:
          'After building a new stock page or component, say "grill me on these changes \u2014 diff this branch against main and prove the snowflake scores render correctly." Don\u2019t manually review \u2014 let Claude verify that scoreColor(), sentimentBadgeVariant(), and data wiring all work.',
        source: "Boris Cherny",
      },
      {
        title: "Iterate after mediocre fixes",
        description:
          'If Claude patches a bug in the screener filter logic but the solution is messy, say "knowing everything you know now, scrap this and implement the elegant solution." This often produces cleaner code for complex filtering across sectors, P/E ranges, and score thresholds.',
        source: "Boris Cherny",
      },
      {
        title: "Minimal micromanagement",
        description:
          'Paste the bug (e.g. "portfolio total value doesn\u2019t sum correctly" or "news sentiment badge shows wrong color"), say "fix." Claude can trace through the mock data, find the rendering logic, and resolve it without you directing the approach.',
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "planning",
    icon: ClipboardList,
    title: "Planning & Specs",
    subtitle: "Plan before coding \u2014 especially for new features",
    tips: [
      {
        title: "Plan mode for every new feature",
        description:
          'Before building watchlist CRUD, portfolio tracking, or chart components, start in plan mode. Example: "Plan how to wire the screener page to the /api/stocks/search route, replacing all 10 mock stocks with real FMP data. Consider caching (SCREENER TTL: 1h) and the existing ScreenerFilters type."',
        source: "Boris Cherny",
      },
      {
        title: "Interview-based specification",
        description:
          'For complex features like the entity registry system (entities.ts, entity-context.ts, tab-registry.ts), start with a minimal spec and tell Claude: "Interview me about requirements using AskUserQuestion." Once the spec is solid, execute in a fresh session with clean context.',
        source: "Thariq Shehzad",
      },
      {
        title: "Phase-wise gated plans",
        description:
          "Break large features into gated phases. Example for wiring real data: Phase 1 \u2014 replace dashboard mock data with API calls, verify renders. Phase 2 \u2014 wire stock/[ticker] page, verify snowflake scores. Phase 3 \u2014 wire screener with filters. Don\u2019t proceed until each phase works.",
      },
      {
        title: "Second Claude as staff engineer",
        description:
          'Spin up a second Claude instance to review your plan. Example: "Review this plan to implement Auth.js v5 in Takovic. Check if the Drizzle schema (users table with plan enum) and the existing (auth)/ route group are properly accounted for."',
        source: "Boris Cherny",
      },
      {
        title: "Prototype over PRD",
        description:
          "Need a new chart component for snowflake-chart.tsx? Build 3\u20135 quick versions with Recharts or TradingView Lightweight Charts rather than writing a detailed spec. At today\u2019s build speeds, prototyping is faster than specifying.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "claude-md",
    icon: FileText,
    title: "CLAUDE.md Management",
    subtitle: "How our project instructions file is structured",
    tips: [
      {
        title: "Our CLAUDE.md is the single source of truth",
        description:
          'Takovic\u2019s CLAUDE.md contains 50 entity rules, the full tech stack, directory structure, DB schema, caching TTLs, scoring engine weights, and design tokens. It\u2019s large (~296 lines) \u2014 consider splitting the 50 entity rules into .claude/rules/entity-rules.md to stay closer to the recommended 200-line limit.',
        source: "Boris Cherny, Dex Horthy",
      },
      {
        title: "Use @imports for linked files",
        description:
          "Our CLAUDE.md starts with @AGENTS.md to pull in Next.js-specific rules. Use this pattern to keep concerns separated \u2014 framework rules in AGENTS.md, business rules in CLAUDE.md, and entity rules in .claude/rules/ if split out.",
      },
      {
        title: "Current State section prevents hallucination",
        description:
          'The "What\u2019s Built" and "What\u2019s NOT Built Yet" sections are critical. They tell Claude that src/components/shared/, src/hooks/, and src/stores/ are empty, preventing it from importing nonexistent code. Update these sections whenever you ship a feature.',
      },
      {
        title: "Known Debt section drives priorities",
        description:
          "The Known Debt section lists sentimentBadgeVariant() duplicated in 4+ files, scoreColor() in 3 pages, and mock data wiring. Claude reads this and proactively consolidates when touching those files. Keep this list current.",
      },
      {
        title: "TL;DR Priority table is your safety net",
        description:
          "The top-10 priority table (barrel exports, no hardcoding, shared types, 500-line cap, etc.) ensures Claude follows the most critical rules even when context is compressed. If Claude ignores rules, move them higher in this table.",
      },
      {
        title: "Design Principles prevent style drift",
        description:
          "Typography (text-xl font-semibold for titles), number formatting (tabular-nums), color conventions (emerald for positive, red for negative), and spacing (space-y-6, gap-4, p-5) are all codified. This is why every page looks consistent without manual review.",
      },
      {
        title: "Settings.json for enforcement",
        description:
          "Rules you want guaranteed (not just suggested) belong in .claude/settings.json. Example: permission patterns for Bash(npm run *), Edit(src/**) enforce access control at the harness level, not through prose instructions Claude might skip.",
        source: "Dani \u00c1vila",
      },
    ],
  },
  {
    id: "agents",
    icon: Bot,
    title: "Agents & Subagents",
    subtitle: "Delegate Takovic tasks to specialized agents",
    tips: [
      {
        title: "Feature-specific agents for Takovic",
        description:
          'Create agents like "stock-page-builder" (knows entity rules 1\u201350, shared components, barrel exports), "data-wiring-agent" (knows FMP endpoints, cache TTLs, Drizzle schema), or "chart-builder" (knows Recharts/TradingView, design tokens). Generic "QA agent" or "backend agent" won\u2019t know our conventions.',
        source: "Boris Cherny",
      },
      {
        title: "Offload to subagents to keep context clean",
        description:
          'When building a full stock entity (4 registries, 12 data files, barrel exports, shared components), tell Claude to "use subagents." One agent scaffolds data files while the main context handles the page component. This prevents context bloat from 50 entity rules.',
        source: "Boris Cherny",
      },
      {
        title: "Separate build and QA agents",
        description:
          "Have one agent build the portfolio CRUD API while another verifies the Drizzle schema relations (portfolios \u2192 portfolio_holdings \u2192 stocks) and tests the endpoint. Isolation prevents confirmation bias \u2014 the QA agent finds issues the builder missed.",
        source: "Boris Cherny",
      },
      {
        title: "Parallel agents with git worktrees",
        description:
          "Use agent teams with worktrees for parallel work. Example: one agent wires the watchlist page to real data while another builds the chart components in src/components/charts/. Each gets an isolated branch, then merge.",
      },
    ],
  },
  {
    id: "commands-skills",
    icon: Terminal,
    title: "Commands & Skills",
    subtitle: "Automate repeated Takovic workflows",
    tips: [
      {
        title: "Slash commands for common Takovic tasks",
        description:
          'Create .claude/commands/ for workflows you repeat: /add-stock (scaffolds entity in 4 registries + 12 data files), /wire-page (replaces mock data with API calls on a page), /check-barrels (verifies all src/data/{ticker}/index.ts re-exports). Lighter weight than agents.',
        source: "Boris Cherny",
      },
      {
        title: "Repetition threshold",
        description:
          "If you\u2019re running the barrel checker, consolidating duplicate helpers, or scaffolding entity files multiple times a day, convert it to a slash command. Example: /consolidate-helpers could find all sentimentBadgeVariant() copies and merge them into src/lib/utils.ts.",
        source: "Boris Cherny",
      },
      {
        title: "Fork context for heavy analysis",
        description:
          'Use context: fork in skill definitions so that computationally heavy tasks (e.g., reviewing all 10 Drizzle table relations, or auditing all 6 dashboard pages for mock data) run in an isolated subagent. Your main context stays clean.',
        source: "Lydia Hallie",
      },
      {
        title: "Write skill triggers for Takovic patterns",
        description:
          'Skill descriptions should trigger on model-relevant cues. Example: "TRIGGER when: user adds a new stock entity, creates data files in src/data/, or mentions barrel exports." Not "Stock entity management skill."',
        source: "Thariq Shehzad",
      },
      {
        title: "Gotchas section for known pitfalls",
        description:
          'Document Claude\u2019s weak patterns in skills. Example gotchas for Takovic: "Always update barrel index.ts when adding data files (Rule 9)." "Never hardcode tickers in JSX (Rule 19)." "Use tabular-nums class on all financial numbers." "sentiment type is a union, not a string."',
        source: "Thariq Shehzad",
      },
      {
        title: "Constraints over step-by-step scripts",
        description:
          'Tell Claude "every stock entity needs 4 registries, 12 core data files, and barrel exports \u2014 follow Rules 1\u201318" rather than scripting each file creation step. Claude performs better with guardrails than rigid instructions.',
        source: "Thariq Shehzad",
      },
    ],
  },
  {
    id: "hooks",
    icon: Zap,
    title: "Hooks",
    subtitle: "Automate formatting and quality gates",
    tips: [
      {
        title: "Auto-format on every edit",
        description:
          "Set up a PostToolUse hook that runs Prettier/ESLint after every file edit. This catches Tailwind class ordering issues, ensures oklch() color tokens are used correctly, and prevents CI failures from inconsistent formatting across our 6 dashboard pages.",
        source: "Boris Cherny",
      },
      {
        title: "Barrel export checker hook",
        description:
          'Create a PreToolUse hook that runs whenever files in src/data/{ticker}/ are edited. It verifies that every export is re-exported in the barrel index.ts (Rule 9 \u2014 the #1 cause of "data exists but doesn\u2019t appear" bugs). Catch violations before they reach a commit.',
      },
      {
        title: "Stop hook for multi-step entity work",
        description:
          'Use a Stop hook to verify completion when building stock entities. Claude sometimes stops after creating data files but before updating the barrel or registering in entities.ts. The hook prompts: "Did you update all 4 registries?"',
        source: "Boris Cherny",
      },
      {
        title: "Measure skill/command adoption",
        description:
          "Deploy PreToolUse hooks to track how often your /add-stock or /wire-page commands fire. If a command exists but never activates, the trigger description needs rewriting or the workflow isn\u2019t matching real usage patterns.",
        source: "Thariq Shehzad",
      },
    ],
  },
  {
    id: "workflows",
    icon: Layers,
    title: "Workflows & Context",
    subtitle: "Manage sessions effectively on a large codebase",
    tips: [
      {
        title: "Compact at 50% \u2014 critical for Takovic",
        description:
          "Our CLAUDE.md is ~296 lines with 50 entity rules, plus 6 page files, 3 API routes, and lib files. Context fills fast. Run /compact at 50% usage. Use /clear when switching between unrelated tasks (e.g., from wiring screener data to building chart components).",
      },
      {
        title: "Vanilla Claude for small fixes",
        description:
          "For fixing a duplicated sentimentBadgeVariant() or updating a cache TTL in lib/cache.ts, plain Claude Code outperforms complex workflows. Save orchestration for multi-file features like the entity registry system.",
      },
      {
        title: "Opus for architecture, Sonnet for code",
        description:
          "Use Opus (/model) when planning the entity registry system, Auth.js v5 integration, or Zustand store architecture. Switch to Sonnet for implementing individual pages, API routes, or component files \u2014 it\u2019s faster and cheaper for code generation.",
        source: "Cat Wu",
      },
      {
        title: 'Use "ultrathink" for scoring engine work',
        description:
          'The snowflake scoring engine (scores.ts) has complex weighted calculations across 5 dimensions with threshold arrays. When modifying scoring logic or adding new dimensions, include "ultrathink" in your prompt to trigger extended reasoning. Also enable thinking mode in /config.',
        source: "Anthropic",
      },
      {
        title: "Name sessions for ongoing work",
        description:
          'Use /rename to label sessions: "wiring-screener-to-api", "entity-registry-buildout", "auth-js-integration." Use /resume to pick them up later. Essential when you\u2019re running parallel sessions for different Takovic features.',
        source: "Cat Wu",
      },
      {
        title: "Rewind bad directions immediately",
        description:
          "If Claude starts hardcoding tickers in JSX (violating Rule 19) or creating one-off chart components per stock (violating Rule 33), use Esc Esc or /rewind immediately. It\u2019s faster than correcting in the same context.",
      },
    ],
  },
  {
    id: "advanced",
    icon: Shield,
    title: "Advanced Workflows",
    subtitle: "Power-user techniques for Takovic development",
    tips: [
      {
        title: "Wildcard permissions for safe automation",
        description:
          'Set permission patterns like Bash(npm run *), Edit(src/**), and Read(src/**) in .claude/settings.json instead of dangerously-skip-permissions. This lets Claude freely edit pages, components, and lib files while blocking access to .env (FMP_API_KEY, ANTHROPIC_API_KEY, database URL).',
        source: "Boris Cherny",
      },
      {
        title: "Sandboxing cuts permission prompts by 84%",
        description:
          "Enable sandboxing for file and network isolation. With 6 page files, 9 UI components, 3 API routes, and multiple lib files, you\u2019ll hit dozens of permission prompts per session without it. Sandboxing makes multi-file refactors (like consolidating duplicated helpers) seamless.",
        source: "Boris Cherny, Cat Wu",
      },
      {
        title: "ASCII diagrams for architecture",
        description:
          "Our CLAUDE.md already has the directory tree structure. Add ASCII diagrams for data flow: FMP API \u2192 cache.ts \u2192 API routes \u2192 page components, or the entity registry flow: entities.ts \u2192 entity-context.ts \u2192 tab-registry.ts \u2192 data/{ticker}/index.ts. Claude parses these better than prose.",
        source: "Boris Cherny",
      },
      {
        title: "Build verification skills for Takovic",
        description:
          "Invest in skills like stock-page-verifier (checks all 4 registries exist, barrel exports are complete, shared components render, no hardcoded tickers) and data-freshness-checker (validates DataMetadata.lastUpdated across all entities). High ROI for every future stock entity.",
        source: "Thariq Shehzad",
      },
      {
        title: "Schedule data freshness monitoring",
        description:
          "Use /loop to monitor FMP API health and cache hit rates locally. Use /schedule for cloud-based tasks like checking if AI summary caches (7-day TTL) need regeneration after earnings releases, even when your machine is off.",
      },
    ],
  },
  {
    id: "git",
    icon: GitBranch,
    title: "Git & PR Practices",
    subtitle: "Keep Takovic PRs small and reviewable",
    tips: [
      {
        title: "One concern per PR, under 150 lines",
        description:
          'Don\u2019t mix "wire screener to API" with "consolidate sentimentBadgeVariant()." Each gets its own PR. Example good PRs: "Extract scoreColor() to utils.ts" (~40 lines), "Add /api/watchlist CRUD route" (~120 lines), "Wire portfolio page to Drizzle" (~100 lines).',
        source: "Boris Cherny",
      },
      {
        title: "Squash merge for clean history",
        description:
          "Use squash merging so each feature is one commit. If the snowflake scoring engine breaks after a merge, you can revert exactly one commit. Linear history makes git bisect trivial across our 10-table schema changes.",
        source: "Boris Cherny",
      },
      {
        title: "Commit as each task completes",
        description:
          'Commit hourly at minimum. After wiring dashboard mock data \u2192 commit. After fixing sentimentLabel() duplication \u2192 commit. After adding a new shared component \u2192 commit. Each commit is a checkpoint you can rewind to with /rewind.',
      },
      {
        title: "Multi-agent code review on PRs",
        description:
          "Use /code-review before merging. It catches issues like: hardcoded tickers (Rule 19), missing barrel exports (Rule 9), duplicated helpers that should be in utils.ts, and components exceeding the 500-line cap (Rule 45).",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "debugging",
    icon: Bug,
    title: "Debugging",
    subtitle: "Diagnose Takovic issues efficiently",
    tips: [
      {
        title: "Screenshot the broken UI",
        description:
          "When snowflake scores render wrong, sentiment badges show incorrect colors, or the sidebar layout breaks, share a screenshot. Claude can visually compare against the design principles (oklch tokens, emerald/red for +/\u2212, tabular-nums on prices) and spot the issue immediately.",
      },
      {
        title: "Browser automation for client-side bugs",
        description:
          "Use Playwright MCP or Chrome DevTools MCP to debug client-side issues. Essential for the Cmd+K search functionality, market status indicator (useMarketStatus hook), sidebar collapse state (SidebarContext), and interactive chart components.",
      },
      {
        title: "Cross-model review for API routes",
        description:
          "Have a separate model review your /api/stocks/[ticker] or /api/analysis/[ticker] implementation. Different models catch different issues \u2014 one might spot a missing cache invalidation, another might flag that the FMP error handling silently swallows 429 rate limit responses.",
      },
      {
        title: "Grep and Glob beat vector search",
        description:
          'For finding where sentimentBadgeVariant() is duplicated, or which pages hardcode ticker symbols, use grep/glob patterns. They\u2019re always current and don\u2019t suffer from stale embeddings. Example: grep "sentimentBadgeVariant" across src/ instantly shows all 4+ copies.',
        source: "Boris Cherny",
      },
      {
        title: "Use /doctor when things break",
        description:
          "If FMP API calls fail, Claude AI analysis returns errors, or Redis cache isn\u2019t connecting, run /doctor first. It checks environment variables (FMP_API_KEY, ANTHROPIC_API_KEY), Neon database connectivity, and Upstash Redis health systematically.",
      },
    ],
  },
  {
    id: "utilities",
    icon: Wrench,
    title: "Utilities & Environment",
    subtitle: "Optimize your Takovic development setup",
    tips: [
      {
        title: "Terminal-first for Takovic development",
        description:
          "Use iTerm, Ghostty, or tmux instead of VS Code/Cursor. With 6 dashboard pages, multiple lib files, and API routes to manage, terminal-first gives better control. Run tmux panes: one for Claude, one for next dev, one for git.",
      },
      {
        title: "Voice input for complex prompts",
        description:
          'Use /voice or Wispr Flow when describing complex features. Saying "Wire the portfolio page to use real holdings data from the Drizzle portfolioHoldings table, calculating total value from shares times current price from the FMP quote endpoint, with a 60-second cache TTL" is 10x faster than typing.',
      },
      {
        title: "Status line for session awareness",
        description:
          "Configure a custom status line showing context usage %, active model (Opus vs Sonnet), and session cost. With Takovic\u2019s large CLAUDE.md eating context, knowing when you\u2019re at 50% (time to /compact) prevents the quality drop.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "daily",
    icon: Calendar,
    title: "Daily Practices",
    subtitle: "Habits for effective Takovic development",
    tips: [
      {
        title: "Update Claude Code daily",
        description:
          "Claude Code ships improvements rapidly. New features like improved Next.js 15 App Router support, better TypeScript inference, and Tailwind CSS 4 understanding directly impact Takovic development quality. Read the changelog after each update.",
      },
      {
        title: "Keep CLAUDE.md current state updated",
        description:
          'After shipping a feature (e.g., implementing chart components), move it from "What\u2019s NOT Built Yet" to "What\u2019s Built" in CLAUDE.md. Update Known Debt when you fix a duplication. Stale project state causes Claude to generate imports for nonexistent code.',
      },
    ],
  },
];

const topWorkflows = [
  {
    name: "Superpowers",
    stars: "118k",
    approach: "TDD-first with Iron Laws and whole-plan review",
    best_for: "Building Takovic\u2019s test suite and CI pipeline",
  },
  {
    name: "Spec Kit",
    stars: "83k",
    approach: "Spec-driven development with constitution pattern",
    best_for: "Entity registry system and data file specs",
  },
  {
    name: "Get Shit Done",
    stars: "43k",
    approach: "Fresh 200K contexts with wave execution",
    best_for: "Wiring mock data to real API endpoints fast",
  },
  {
    name: "BMAD-METHOD",
    stars: "43k",
    approach: "Full SDLC with agent personas",
    best_for: "Full feature buildout (Auth, CRUD, charts)",
  },
  {
    name: "HumanLayer",
    stars: "10k",
    approach: "RPI pattern (Request-Plan-Implement)",
    best_for: "Scaling Takovic beyond 50+ stock entities",
  },
];

const quickReference = [
  { command: "/compact", description: "Compress at 50% (our CLAUDE.md is large)" },
  { command: "/clear", description: "Fresh context between features" },
  { command: "/model", description: "Opus for planning, Sonnet for code" },
  { command: "/rewind", description: "Undo when rules are violated" },
  { command: "/rename", description: "Label: \u201Cwiring-screener\u201D, \u201Centity-registry\u201D" },
  { command: "/doctor", description: "Check FMP/Anthropic/Neon/Redis keys" },
  { command: "/code-review", description: "Catch Rule 9/19/45 violations" },
  { command: "/voice", description: "Describe complex data flows verbally" },
  { command: "/loop", description: "Monitor FMP API health locally" },
  { command: "/schedule", description: "Refresh AI summary caches (7d TTL)" },
  { command: "Esc Esc", description: "Rewind hardcoded tickers/bad patterns" },
  { command: "ultrathink", description: "For scoring engine & schema work" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DevGuidePage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Developer Guide
        </h1>
        <p className="text-sm text-muted-foreground">
          Claude Code best practices applied to Takovic &mdash; real examples
          from our codebase
        </p>
      </div>

      {/* Quick reference bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">
              Quick Reference
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Key commands and shortcuts to keep handy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {quickReference.map((item) => (
              <div key={item.command} className="flex items-baseline gap-2">
                <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                  {item.command}
                </code>
                <span className="truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core workflow pattern */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Target className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Core Workflow Pattern
              </p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">
                  Research &rarr; Plan &rarr; Execute &rarr; Review &rarr; Ship
                </span>{" "}
                &mdash; Plan before coding (entity registry, Auth.js, CRUD
                APIs). Use Opus for architecture, Sonnet for pages. Compact at
                50% (our CLAUDE.md is ~296 lines). Follow the 50 entity rules.
                Commit after each task. One feature per PR, under 150 lines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top community workflows */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          Recommended Workflows for Takovic
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topWorkflows.map((wf) => (
            <Card
              key={wf.name}
              className="transition-colors hover:bg-muted/30"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-foreground">
                    {wf.name}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] tabular-nums"
                  >
                    {wf.stars}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{wf.approach}</p>
                <p className="mt-2 text-[11px] text-muted-foreground/80">
                  <span className="font-medium text-muted-foreground">
                    Best for:
                  </span>{" "}
                  {wf.best_for}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Tip sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} id={section.id}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    {section.subtitle}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] tabular-nums"
                >
                  {section.tips.length}{" "}
                  {section.tips.length === 1 ? "tip" : "tips"}
                </Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {section.tips.map((tip, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400" />
                              <p className="text-sm font-medium text-foreground">
                                {tip.title}
                              </p>
                            </div>
                            <p className="mt-1.5 pl-5 text-xs text-muted-foreground leading-relaxed">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                        {tip.source && (
                          <p className="mt-2 pl-5 text-[10px] text-muted-foreground/70">
                            Source: {tip.source}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
