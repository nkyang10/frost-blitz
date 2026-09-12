# AGENTS.md — Late-Comer Agent Protocol

> You are the **controller** for the `blender` project: a 3D web game called **Frost Blitz** —
> a cute "orbit-siege" gameplay: slide a smiling snowman turret at 0–360° around a ring and lob
> snowballs at the frost-pig fortress in the center (see 40-knowledge/game-design-bible.md). This file bootstraps you. Read it fully before doing anything. It is maintained by
> agents, for agents — keep it accurate.

## Mission

Execute the user's requests against this project safely, transparently, and repeatably, while
keeping this folder self-maintained so any successor agent can take over instantly — including
**on a different machine**.

## Golden rules

1. **Docs first, code second.** Every meaningful change is reflected in the docs the same session.
2. **The folder is the source of truth.** No out-of-band changes. Everything the user asked is
   planned, implemented, and logged here.
3. **No secrets in the repo.** Real `opencode.json`, `*.env`, API keys are git-ignored. Never
   commit live keys.
4. **Commit history travels with the folder.** The repo is local; it moves to the next dev device
   by copying the folder. Keep the working tree clean and history meaningful.
5. **Debian/Ubuntu assumed** for all bootstrap commands unless stated otherwise.
6. **Read-only answers only** while in plan mode; write only after approval.

## Mandatory reading order (before first action)

1. `README.md` — operating model + folder map.
2. `10-status/current-state.md` — latest known state snapshot.
3. `10-status/open-followups.md` — anything pending from previous sessions.
4. `20-logs/command-log.md` — skim the last entries to see recent actions.
5. `30-runbooks/` — if the task matches an existing runbook, follow it.
6. `40-knowledge/decisions-log.md` + `40-knowledge/game-design-bible.md` — the design contract
   BEFORE changing anything gameplay-related.
7. `50-projects/p001-frost-blitz/README.md` — project brief + status + deliverables map.

## Per-session protocol

### Before acting
- Open a **session record**: create `20-logs/sessions/<YYYY-MM-DD>_s<NNN>_<slug>.md`
  (copy `30-runbooks/TEMPLATE.md` if you need a skeleton).
- State intent in one line to the user before touching files.

### While acting
- Keep `10-status/current-state.md` and `10-status/open-followups.md` updated **in the same
  session** you change anything they describe (drift check).
- Use existing runbooks (`30-runbooks/`) for repeated operations; improve them when you discover
  a better way.
- Record shell commands that matter in `20-logs/command-log.md`.

### After acting
- Update the session record: what you did, what you verified, what is still open.
- Update `current-state.md` ("Last updated:<timestamp> — what changed").
- Update `open-followups.md` (close done items, add new ones).
- Do NOT commit unless the user explicitly asks (per user preference in s001).

## Decisions that need a doc entry
- New dependency / change of stack → new entry in `40-knowledge/decisions-log.md`.
- Gameplay/balance/level change → update `game-design-bible.md` and note the decision.
- New architecture or pipeline → new runbook in `30-runbooks/` if repeatable.

## Testing expectations
- WebGL cannot run headless: verification = `npm run build` succeeds + `.glb` files parse +
  manual playtest per `30-runbooks/rb-001-local-dev-loop.md`.
- Always verify a change builds before closing the follow-up ticket.
