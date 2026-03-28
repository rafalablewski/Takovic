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
    subtitle: "How to communicate effectively with Claude",
    tips: [
      {
        title: "Challenge Claude, don't babysit",
        description:
          'Use prompts like "grill me on these changes and don\'t make a PR until I pass your test" or "prove to me this works." Have Claude diff between main and your branch instead of manually reviewing.',
        source: "Boris Cherny",
      },
      {
        title: "Iterate after mediocre fixes",
        description:
          'When the first solution is suboptimal, say "knowing everything you know now, scrap this and implement the elegant solution" to get a fundamentally better approach.',
        source: "Boris Cherny",
      },
      {
        title: "Minimal micromanagement",
        description:
          "Paste the bug, say \"fix.\" Avoid directing implementation details \u2014 Claude resolves most bugs independently when given the freedom to explore the codebase.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "planning",
    icon: ClipboardList,
    title: "Planning & Specs",
    subtitle: "Structure your work before writing code",
    tips: [
      {
        title: "Always start with plan mode",
        description:
          "Begin every project or feature with a planning phase. This prevents wasted context on dead-end approaches and produces better architecture.",
        source: "Boris Cherny",
      },
      {
        title: "Interview-based specification",
        description:
          "Start with a minimal spec and ask Claude to interview you using the AskUserQuestion tool to flesh out requirements. Then execute the full spec in a fresh session with clean context.",
        source: "Thariq Shehzad",
      },
      {
        title: "Phase-wise gated plans",
        description:
          "Break plans into phases, each gated by tests (unit, automation, integration). Don\u2019t proceed to the next phase until the current one passes all checks.",
      },
      {
        title: "Secondary review",
        description:
          "Spin up a second Claude instance acting as a staff engineer to review your plan. Alternatively, use a cross-model approach (e.g., Claude for planning, Codex for review).",
        source: "Boris Cherny",
      },
      {
        title: "Prototype over PRD",
        description:
          "Build 20\u201330 quick versions instead of writing lengthy product requirement documents. The cost of building is now low enough that prototyping is faster than specifying.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "claude-md",
    icon: FileText,
    title: "CLAUDE.md Management",
    subtitle: "Keep your project context files effective",
    tips: [
      {
        title: "Keep files under 200 lines",
        description:
          "Each CLAUDE.md file should stay under 200 lines. Shorter files get more consistent compliance. HumanLayer\u2019s ~60-line file is considered a best practice benchmark.",
        source: "Boris Cherny, Dex Horthy",
      },
      {
        title: "Use conditional importance tags",
        description:
          'Wrap domain rules in <important if="..."> tags to prevent Claude from ignoring them as files grow larger. This keeps critical rules front-and-center.',
        source: "Dex Horthy",
      },
      {
        title: "Split into .claude/rules/",
        description:
          "For extensive guidance, use the .claude/rules/ directory structure. Multiple CLAUDE.md files load via ancestor/descendant in monorepos.",
      },
      {
        title: "First-run success test",
        description:
          "Any developer launching Claude should be able to run tests on first try. If setup commands are missing, your CLAUDE.md is incomplete.",
        source: "Dex Horthy",
      },
      {
        title: "Settings over prose",
        description:
          "Use settings.json for behavior that must be enforced by the harness (permissions, formatting) rather than relying on CLAUDE.md instructions alone.",
        source: "Dani \u00c1vila",
      },
      {
        title: "Finish migrations completely",
        description:
          "Partially migrated frameworks confuse models. Complete migrations fully before expecting Claude to work reliably with the codebase.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "agents",
    icon: Bot,
    title: "Agents & Subagents",
    subtitle: "Delegate work to specialized agents",
    tips: [
      {
        title: "Feature-specific over generic",
        description:
          'Create agents with specialized context and skills (e.g., "stock-page-builder") rather than generic roles like "QA agent" or "backend agent."',
        source: "Boris Cherny",
      },
      {
        title: 'Say "use subagents"',
        description:
          'Explicitly direct Claude to "use subagents" for task distribution. This keeps the main context window clean and focused on orchestration.',
        source: "Boris Cherny",
      },
      {
        title: "Test-time compute separation",
        description:
          "Separate context windows improve results. Have one agent build features while another QAs. The isolation prevents confirmation bias.",
        source: "Boris Cherny",
      },
      {
        title: "Team coordination with worktrees",
        description:
          "Use agent teams with tmux and git worktrees for parallel development. Each agent gets its own isolated branch to work on.",
      },
    ],
  },
  {
    id: "commands-skills",
    icon: Terminal,
    title: "Commands & Skills",
    subtitle: "Automate repeated workflows",
    tips: [
      {
        title: "Commands over subagents for workflows",
        description:
          "Prefer commands (.claude/commands/) for workflow orchestration. They\u2019re lighter weight and inject knowledge into existing context rather than spawning new ones.",
        source: "Boris Cherny",
      },
      {
        title: "Repetition threshold",
        description:
          "If you\u2019re doing something multiple times a day, convert it into a slash command or skill. The investment pays off within a single day.",
        source: "Boris Cherny",
      },
      {
        title: "Context forking for skills",
        description:
          'Use context: fork in skill definitions to isolate execution in subagents. The main context only sees results, keeping it clean for the primary task.',
        source: "Lydia Hallie",
      },
      {
        title: "Write descriptions as triggers",
        description:
          'Skill descriptions should be written for model consumption ("when should I fire?") not as human-readable summaries. This improves auto-discovery.',
        source: "Thariq Shehzad",
      },
      {
        title: "Include a gotchas section",
        description:
          "Build a failure-points section in skills that documents Claude\u2019s known weak patterns. This preemptively steers around common mistakes.",
        source: "Thariq Shehzad",
      },
      {
        title: "Constraint-based guidance",
        description:
          "Give goals and constraints rather than step-by-step prescriptions. Claude performs better with guardrails than with rigid scripts.",
        source: "Thariq Shehzad",
      },
    ],
  },
  {
    id: "hooks",
    icon: Zap,
    title: "Hooks",
    subtitle: "Automate quality gates and formatting",
    tips: [
      {
        title: "Auto-format with PostToolUse",
        description:
          "A PostToolUse hook handles the final 10% of formatting automatically, preventing CI failures from linting issues. Set it up once, never worry about formatting again.",
        source: "Boris Cherny",
      },
      {
        title: "Permission routing to Opus",
        description:
          "Route permission requests through a hook that sends them to Opus for security scanning and auto-approval. Reduces manual confirmations while maintaining safety.",
        source: "Boris Cherny",
      },
      {
        title: "Stop hook for continuation",
        description:
          "Use a Stop hook to prompt continuation verification at turn end. This catches cases where Claude stops prematurely on multi-step tasks.",
        source: "Boris Cherny",
      },
      {
        title: "Measure skill adoption",
        description:
          "Deploy PreToolUse hooks to measure how often skills fire. This identifies undertriggering \u2014 skills that exist but never activate.",
        source: "Thariq Shehzad",
      },
    ],
  },
  {
    id: "workflows",
    icon: Layers,
    title: "Workflows & Context",
    subtitle: "Manage context windows and sessions",
    tips: [
      {
        title: "Compact at 50% context",
        description:
          "Manually run /compact when context reaches 50% capacity. Avoid the \"agent dumb zone\" where context is nearly full. Use /clear when switching tasks entirely.",
      },
      {
        title: "Vanilla wins on small tasks",
        description:
          "Plain Claude Code without elaborate workflows outperforms complex setups on smaller tasks. Only reach for heavy orchestration on large, multi-step features.",
      },
      {
        title: "Opus for planning, Sonnet for code",
        description:
          "Use /model to switch between models strategically. Opus excels at architectural planning; Sonnet is faster and more cost-effective for code generation.",
        source: "Cat Wu",
      },
      {
        title: 'Use "ultrathink" for hard problems',
        description:
          'Include the keyword "ultrathink" in your prompt for extended reasoning mode. Also enable thinking mode and Explanatory output style in /config for better decision visibility.',
        source: "Anthropic",
      },
      {
        title: "Name and resume sessions",
        description:
          "Use /rename to label important sessions (e.g., \"TODO - refactor scoring engine\") and /resume to pick them up later. Essential when running multiple instances.",
        source: "Cat Wu",
      },
      {
        title: "Rewind instead of correcting",
        description:
          "Use Esc Esc or /rewind to undo off-track decisions. It\u2019s more effective than trying to correct course in the same context window.",
      },
    ],
  },
  {
    id: "advanced",
    icon: Shield,
    title: "Advanced Workflows",
    subtitle: "Power-user techniques for complex projects",
    tips: [
      {
        title: "Wildcard permissions",
        description:
          'Use permission patterns like Bash(npm run *) and Edit(/docs/**) instead of dangerously-skip-permissions. Granular wildcards are safe and convenient.',
        source: "Boris Cherny",
      },
      {
        title: "Sandboxing reduces prompts by 84%",
        description:
          "Enable sandboxing for file and network isolation. It dramatically reduces permission prompts while maintaining security boundaries.",
        source: "Boris Cherny, Cat Wu",
      },
      {
        title: "ASCII diagrams in CLAUDE.md",
        description:
          "Use ASCII art extensively for architecture understanding. Claude parses ASCII diagrams better than prose descriptions of system topology.",
        source: "Boris Cherny",
      },
      {
        title: "Invest in verification skills",
        description:
          "Spend a week perfecting verification skills (e.g., signup-flow-driver, checkout-verifier). The ROI is enormous \u2014 automated acceptance testing for every change.",
        source: "Thariq Shehzad",
      },
      {
        title: "Scheduled and looping tasks",
        description:
          "Use /loop for local recurring monitoring (up to 3 days). Use /schedule for cloud-based tasks that run even when your machine is off.",
      },
    ],
  },
  {
    id: "git",
    icon: GitBranch,
    title: "Git & PR Practices",
    subtitle: "Keep your version control clean and reviewable",
    tips: [
      {
        title: "PRs under 150 lines",
        description:
          "Keep pull requests under 150 lines changed (median: 118 lines from 141 PRs). One feature per PR. Smaller PRs get reviewed faster and merge cleaner.",
        source: "Boris Cherny",
      },
      {
        title: "Squash merge always",
        description:
          "Use squash merging for clean linear history. One commit per feature enables easy revert and bisect when issues arise.",
        source: "Boris Cherny",
      },
      {
        title: "Commit at least hourly",
        description:
          "Commit as soon as a task completes. Frequent commits provide checkpoints and reduce the blast radius of mistakes.",
      },
      {
        title: "Multi-agent code review",
        description:
          "Use /code-review for parallel analysis catching bugs, security vulnerabilities, and regressions across different dimensions simultaneously.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "debugging",
    icon: Bug,
    title: "Debugging",
    subtitle: "Diagnose and fix issues efficiently",
    tips: [
      {
        title: "Share screenshots habitually",
        description:
          "When stuck on UI issues, share screenshots with Claude. Visual context dramatically improves diagnosis speed and accuracy.",
      },
      {
        title: "Use browser automation MCPs",
        description:
          "Claude in Chrome, Playwright MCP, or Chrome DevTools MCP give Claude console log visibility. Essential for debugging client-side issues.",
      },
      {
        title: "Cross-model QA",
        description:
          "Deploy a separate model (e.g., Codex) to review your plan and implementation. Different models catch different classes of issues.",
      },
      {
        title: "Agentic search over RAG",
        description:
          "Glob and grep patterns outperform vector databases for code search. Code drifts invalidate embeddings, but file search is always current.",
        source: "Boris Cherny",
      },
      {
        title: "Use /doctor for diagnostics",
        description:
          "Run /doctor to diagnose installation, authentication, and configuration problems. It checks everything systematically.",
      },
    ],
  },
  {
    id: "utilities",
    icon: Wrench,
    title: "Utilities & Environment",
    subtitle: "Optimize your development environment",
    tips: [
      {
        title: "Terminal over IDE",
        description:
          "Use iTerm, Ghostty, or tmux instead of VS Code or Cursor for the best Claude Code experience. Terminal-first gives more control and fewer conflicts.",
      },
      {
        title: "Voice input for 10x speed",
        description:
          "Deploy Wispr Flow or built-in /voice for speech-to-prompt input. Voice prompting is significantly faster than typing for complex instructions.",
      },
      {
        title: "Custom status line",
        description:
          "Configure a custom status line showing context usage, model, cost, and session info. Keeps you aware of resource consumption at a glance.",
        source: "Boris Cherny",
      },
    ],
  },
  {
    id: "daily",
    icon: Calendar,
    title: "Daily Practices",
    subtitle: "Habits for staying current and effective",
    tips: [
      {
        title: "Update Claude Code daily",
        description:
          "Run updates daily and read the changelog. Claude Code ships improvements and new features rapidly \u2014 staying current gives you an edge.",
      },
      {
        title: "Follow key community voices",
        description:
          "Monitor Boris Cherny (creator), Thariq Shehzad, Cat Wu, Lydia Hallie, and the official Claude accounts for tips, patterns, and announcements.",
      },
    ],
  },
];

const topWorkflows = [
  {
    name: "Superpowers",
    stars: "118k",
    approach: "TDD-first with Iron Laws and whole-plan review",
    best_for: "Teams wanting test-driven rigor",
  },
  {
    name: "Spec Kit",
    stars: "83k",
    approach: "Spec-driven development with constitution pattern",
    best_for: "Documentation-heavy projects",
  },
  {
    name: "Get Shit Done",
    stars: "43k",
    approach: "Fresh 200K contexts with wave execution",
    best_for: "Fast-paced feature shipping",
  },
  {
    name: "BMAD-METHOD",
    stars: "43k",
    approach: "Full SDLC with agent personas",
    best_for: "Enterprise-scale projects",
  },
  {
    name: "HumanLayer",
    stars: "10k",
    approach: "RPI pattern (Request-Plan-Implement)",
    best_for: "Large codebases (300k+ LOC)",
  },
];

const quickReference = [
  { command: "/compact", description: "Compress context at 50% usage" },
  { command: "/clear", description: "Fresh context for new tasks" },
  { command: "/model", description: "Switch between Opus and Sonnet" },
  { command: "/rewind", description: "Undo off-track decisions" },
  { command: "/rename", description: "Label sessions for later /resume" },
  { command: "/doctor", description: "Diagnose configuration issues" },
  { command: "/code-review", description: "Multi-agent PR analysis" },
  { command: "/voice", description: "Push-to-talk voice input" },
  { command: "/loop", description: "Local recurring tasks (up to 3 days)" },
  { command: "/schedule", description: "Cloud-based scheduled tasks" },
  { command: "Esc Esc", description: "Rewind to last checkpoint" },
  { command: "ultrathink", description: "Trigger extended reasoning" },
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
          Best practices for working with Claude Code &mdash; 86 tips from the
          community
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
                &mdash; Always plan before coding. Use Opus for architecture
                decisions, Sonnet for implementation. Compact context at 50%.
                Commit hourly. Keep PRs under 150 lines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top community workflows */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">
          Top Community Workflows
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
