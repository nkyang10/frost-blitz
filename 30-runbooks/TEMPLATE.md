# Runbook Template — `<rb-NNN-<slug>.md`

Copy this file to create a new runbook. Keep it command-exact and machine-independent
(Debian/Ubuntu assumed unless stated).

```md
# rb-NNN-<slug>

**Purpose:** one-paragraph summary of what this runbook achieves.
**Trigger:** when to use it (state/ticket, e.g. FU-002).
**Environment:** Debian/Ubuntu unless noted. Assumes repo root = $BLENDER.

## Steps

1. <action>
   ```bash
   <command>
   ```
2. <action>

## Verify
- <exact check that proves success, e.g. `npm run build` exits 0>

## Troubleshooting
| Symptom | Fix |
|---|---|
| <symptom> | <fix> |
```
