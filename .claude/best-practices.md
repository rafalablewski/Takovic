# Claude Code Best Practices

> Extracted from [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice)

---

## Core Architecture: Command → Agent → Skill

- **Commands** (`.claude/commands/<name>.md`) — user-invoked prompt templates for workflow orchestration
- **Subagents** (`.claude/agents/<name>.md`) — autonomous actors in isolated contexts with custom tools, permissions, models, memory
- **Skills** (`.claude/skills/<name>/SKILL.md`) — configurable, auto-discoverable knowledge with context forking and progressive disclosure
- **Hooks** (`.claude/hooks/`) — user-defined handlers (scripts, HTTP, prompts) running outside the agentic loop on events
- **MCP Servers** — external tool/database/API connections via `.claude/settings.json` or `.mcp.json`

---

## 86 Tips & Tricks

### Prompting (3)

1. **Challenge Claude, don't babysit** — "Grill me on these changes and don't make a PR until I pass your test" or "prove to me this works." Have Claude diff between main and your branch. *(Boris Cherny)*
2. **Iterate after mediocre fix** — "Knowing everything you know now, scrap this and implement the elegant solution." *(Boris Cherny)*
3. **Minimal micromanagement** — Paste the bug, say "fix." Avoid directing implementation details — Claude fixes most bugs independently. *(Boris Cherny)*

### Planning & Specs (6)

1. **Always start with plan mode** — Begin every project with a planning phase. *(Boris Cherny)*
2. **Interview-based specification** — Start with a minimal spec, ask Claude to interview you using the AskUserQuestion tool, then execute in a fresh session. *(Thariq Shehzad)*
3. **Phase-wise gated plans** — Create plans with multiple test types (unit, automation, integration) per phase.
4. **Secondary review** — Spin up a second Claude instance as a staff engineer to review your plan, or use a cross-model approach. *(Boris Cherny)*
5. **Detailed specifications** — Write comprehensive specs reducing ambiguity before handing work off. *(Boris Cherny)*
6. **Prototype over PRD** — Build 20-30 versions instead of lengthy specifications — build costs are now low. *(Boris Cherny)*

### CLAUDE.md Management (8)

1. **Line count limits** — Keep each CLAUDE.md under 200 lines. HumanLayer uses ~60 lines as best practice. *(Boris Cherny, Dex Horthy)*
2. **Conditional importance tags** — Wrap domain rules in `<important if="...">` tags to prevent Claude from ignoring them as files grow. *(Dex Horthy)*
3. **Multiple CLAUDE.md files** — Use monorepo-specific instances with ancestor/descendant loading.
4. **Split large instructions** — Use `.claude/rules/` directory structure for extensive guidance.
5. **No guarantees** — memory.md and constitution.md don't guarantee compliance.
6. **First-run success** — Any developer launching Claude should run tests on first try; missing setup commands = incomplete CLAUDE.md. *(Dex Horthy)*
7. **Codebase cleanliness** — Finish migrations completely; partially migrated frameworks confuse models. *(Boris Cherny)*
8. **Settings over instructions** — Use `settings.json` for harness-enforced behavior rather than CLAUDE.md prose. *(Dani Ávila)*

### Agents (4)

1. **Feature-specific subagents** — Create agents with specialized context and skills rather than generic QA/backend roles. *(Boris Cherny)*
2. **Offload for focus** — Direct Claude to "use subagents" for task distribution, keeping main context clean. *(Boris Cherny)*
3. **Team coordination** — Use agent teams with tmux and git worktrees for parallel development.
4. **Test-time compute** — Separate context windows improve results; one agent builds while another QAs. *(Boris Cherny)*

### Commands (3)

1. **Commands over subagents** — Prefer commands for workflow implementation. *(Boris Cherny)*
2. **Slash commands for inner loops** — Create `/command` entries for frequently-repeated workflows in `.claude/commands/`. *(Boris Cherny)*
3. **Repetition threshold** — If doing something multiple times daily, convert to a skill or command. *(Boris Cherny)*

### Skills (9)

1. **Context forking** — Use `context: fork` to isolate skill execution in subagents; main context sees only results. *(Lydia Hallie)*
2. **Monorepo organization** — Structure skills in subfolders for larger repositories.
3. **Folder structure** — Skills are folders containing `references/`, `scripts/`, `examples/` for progressive disclosure. *(Thariq Shehzad)*
4. **Gotchas section** — Build a failure-points section in skills showing Claude's weak patterns. *(Thariq Shehzad)*
5. **Description as trigger** — Write descriptions for model consumption ("when should I fire?"), not human summary. *(Thariq Shehzad)*
6. **Avoid obvious content** — Focus on pushing Claude from default behavior, not restating facts. *(Thariq Shehzad)*
7. **Constraint-based guidance** — Give goals and constraints rather than step-by-step prescriptions. *(Thariq Shehzad)*
8. **Provide composable assets** — Include scripts and libraries so Claude combines rather than reconstructs. *(Thariq Shehzad)*
9. **Dynamic shell output** — Embed `` !`command` `` in SKILL.md to inject dynamic output; model sees only the result. *(Lydia Hallie)*

### Hooks (5)

1. **On-demand hooks** — Use `/careful` and `/freeze` blocks for destructive command and edit restrictions. *(Thariq Shehzad)*
2. **Usage measurement** — Deploy PreToolUse hooks to measure skill adoption and identify undertriggering. *(Thariq Shehzad)*
3. **Auto-format with hooks** — PostToolUse hook handles final 10% formatting, avoiding CI failures. *(Boris Cherny)*
4. **Permission routing** — Route permission requests to Opus via hook for security scanning and auto-approval. *(Boris Cherny)*
5. **Stop hook nudging** — Use Stop hook to prompt continuation verification at turn end. *(Boris Cherny)*

### Workflows (7)

1. **Context compaction strategy** — Avoid agent dumb zone; manual `/compact` at max 50% context usage. Use `/clear` for task switches.
2. **Vanilla approach** — Vanilla Claude Code outperforms complex workflows on smaller tasks.
3. **Model and context commands** — `/model` for selection, `/context` for usage, `/usage` for limits, `/config` for settings. Run Opus for planning, Sonnet for code. *(Cat Wu)*
4. **Extended thinking** — Use `thinking mode: true` and Explanatory output style in `/config` for better decision visibility. *(Boris Cherny)*
5. **High-effort reasoning** — Include "ultrathink" keyword for extended reasoning mode. *(Anthropic docs)*
6. **Session management** — Use `/rename` for important sessions (e.g., "TODO - refactor task") and `/resume` later; label instances when running multiple. *(Cat Wu)*
7. **Checkpointing** — Use `Esc Esc` or `/rewind` to undo off-track decisions rather than correcting in the same context.

### Advanced Workflows (6)

1. **ASCII diagrams** — Use ASCII art extensively for architecture understanding. *(Boris Cherny)*
2. **Scheduled tasks** — `/loop` for local 3-day recurring monitoring; `/schedule` for cloud-based tasks running when machine is off.
3. **Long-running autonomy** — Deploy Ralph Wiggum plugin for extended autonomous task completion. *(Boris Cherny)*
4. **Wildcard permissions** — Use permission patterns like `Bash(npm run *)` and `Edit(/docs/**)` instead of `dangerously-skip-permissions`. *(Boris Cherny)*
5. **Sandboxing benefits** — Sandboxing reduces permission prompts by 84% through file and network isolation. *(Boris Cherny, Cat Wu)*
6. **Product verification skills** — Invest week-long effort perfecting verification skills (signup-flow-driver, checkout-verifier) for high ROI. *(Thariq Shehzad)*

### Git & PR Practices (5)

1. **Small focused PRs** — Keep PRs under 150 lines (p50: 118 lines from 141 PRs changing 45K lines daily); one feature per PR. *(Boris Cherny)*
2. **Squash merge always** — Use squash merging for clean linear history; one commit per feature enables easy revert and bisect. *(Boris Cherny)*
3. **Frequent commits** — Commit at least hourly as soon as tasks complete.
4. **Tag @claude for lint rules** — Mention @claude on coworker PRs to auto-generate lint rules automating review feedback. *(Boris Cherny)*
5. **Multi-agent code review** — Use `/code-review` for parallel analysis catching bugs, vulnerabilities, and regressions. *(Boris Cherny)*

### Debugging (7)

1. **Screenshot sharing** — Habitually share screenshots with Claude when stuck on issues.
2. **MCP browser automation** — Use Claude in Chrome, Playwright MCP, or Chrome DevTools MCP for console log visibility.
3. **Background task logging** — Run terminals as background tasks for better debugging visibility.
4. **Diagnostic tool** — Use `/doctor` command to diagnose installation, authentication, and configuration problems.
5. **Compaction error resolution** — Switch to 1M token model via `/model`, then run `/compact`.
6. **Cross-model QA** — Deploy a separate model (e.g., Codex) for plan and implementation review.
7. **Agentic search over RAG** — Glob and grep patterns outperform vector databases; code drifts invalidate embeddings. *(Boris Cherny)*

### Utilities (5)

1. **Terminal over IDE** — Use iTerm/Ghostty/tmux instead of VS Code/Cursor for best experience.
2. **Voice input** — Deploy Wispr Flow for 10x productivity voice prompting.
3. **Feedback tools** — Install claude-code-hooks for feedback systems.
4. **Status line** — Use custom status line showing context, model, cost, and session info. *(Boris Cherny)*
5. **Settings exploration** — Explore Plans Directory, Spinner Verbs, and output customization in settings.json. *(Boris Cherny)*

### Daily Practices (3)

1. **Daily updates** — Update Claude Code daily and read the changelog.
2. **Community engagement** — Follow r/ClaudeAI and r/ClaudeCode subreddits.
3. **Key figures to follow** — Boris Cherny, Thariq Shehzad, Cat Wu, Lydia Hallie, Noah Zweben, Anthony Morris, Alex Albert, Kenneth Neil, and Claude official accounts on X.

---

## Top Development Workflows (by community adoption)

| Workflow | Stars | Approach | Agents | Commands | Skills |
|---|---|---|---|---|---|
| **Superpowers** | 118k | TDD-first, Iron Laws, whole-plan review | 5 | 3 | 14 |
| **Everything Claude Code** | 111k | Instinct scoring, AgentShield, multi-lang rules | 28 | 63 | 125 |
| **Spec Kit** | 83k | Spec-driven, constitution, 22+ tools | 0 | 9+ | 0 |
| **gstack** | 52k | Role personas, `/codex_review`, parallel sprints | 0 | 0 | 31 |
| **Get Shit Done** | 43k | Fresh 200K contexts, wave execution, XML plans | 18 | 57 | 0 |
| **BMAD-METHOD** | 43k | Full SDLC, agent personas, 22+ platforms | 0 | 0 | 42 |
| **OpenSpec** | 35k | Delta specs, brownfield, artifact DAG | 0 | 11 | 0 |
| **Compound Engineering** | 11k | Compound Learning, multi-platform CLI, plugins | 47 | 4 | 42 |
| **HumanLayer** | 10k | RPI, context engineering, 300k+ LOC | 6 | 27 | 0 |

### Key workflow patterns

- **RPI (Request-Plan-Implement)** — Three-phase approach isolating research, planning, and execution
- **Cross-Model** — Claude Code + Codex parallel sessions leveraging distinct model strengths
- **Ralph Wiggum Loop** — Autonomous iteration framework for extended reasoning without human intervention
- **Wave Execution** — Fresh 200K-token contexts preventing context degradation on long tasks

---

## Key Takeaways for This Project

### Immediately applicable

- **Plan first** — Use plan mode before implementing features
- **Small PRs** — One feature per PR, under 150 lines
- **Compact early** — Manual `/compact` at 50% context; `/clear` on task switch
- **Commit often** — At least hourly
- **Challenge outputs** — "Prove this works" / "scrap and do it elegantly"
- **Use subagents** — Offload subtasks to keep main context clean
- **Slash commands** — Convert repeated workflows into `.claude/commands/`
- **Auto-format hook** — PostToolUse hook for formatting prevents CI failures
- **Wildcard permissions** — `Bash(npm run *)` instead of blanket skip

### Worth adopting for Takovic

- **Skills for verification** — Build stock-page-verifier, data-freshness-checker skills
- **Interview-based specs** — Use AskUserQuestion for new feature requirements
- **Gotchas sections** — Document known Claude failure patterns in skills
- **ASCII architecture diagrams** — Add to CLAUDE.md for codebase understanding
- **Context forking** — Isolate heavy analysis tasks in forked contexts
