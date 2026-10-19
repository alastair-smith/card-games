---
name: run-retro
description: Run a retrospective on the current session, or a past one. Find corrections worth writing down, approval prompts to remove, commands worth scripting and process friction, agree each fix with the user, then run one retro of the retro. Use when the user asks for a retro or to review how a session went.
---

# Run a retro

## 1. Gather evidence

Reread the conversation for:

- **Corrections:** the user changing code, wording or an approach you chose
- **Questioned claims:** "are you sure?", "check the docs", or a claim you later
  retracted
- **Reminders:** anything the user had to point out that you'd skipped
- **Repeated commands:** the same kind of command run several times

For approval prompts, use the transcript rather than guessing from the
allowlist. This lists every tool call the user approved or rejected by hand
(add `--session <id>` for a past session):

```bash
./.claude/skills/run-retro/scripts/list-llm-approvals.ts
```

## 2. Sort into categories

1. **Corrections** worth turning into a rule
2. **Questioned claims**, and what checking first would have looked like
3. **Approval prompts:** for each, use an approved command that already
   exists, allowlist it if it's always safe, give it a strict script, or
   leave it prompting if each run deserves a look
4. **Repeated commands** worth a script
5. **Process friction:** how the work was done, not the code

Skip one-offs that won't recur.

## 3. Decide where each fix belongs

Check what reads a file before proposing it. For example, `REVIEW.md` is read
only by the Code Review service, not by `/code-review`.

| Fix | Where |
|---|---|
| Code, testing or workflow rule for the whole repo | `CLAUDE.md`, kept short: no one-off review notes |
| How a workflow such as raising a PR runs | That skill's `SKILL.md` |
| A command that's repeated or needs approval | A skill script, allowlisted unless each run should ask |
| A read-only command or docs site that's always safe | The allowlist in `.claude/settings.json` |
| Context about one piece of code | A comment there |
| The user's preferences, or anything not about this repo | Memory |

Draft rules as the general principle, not as a description of the incident
that prompted them.

## 4. Go through it with the user

List the points, one line each, then detail one at a time. Give each point's
items as a checklist, and don't move on until every item has a decision: do
it, skip it or leave it for later. Changes follow the usual issue and branch
rules; group small doc changes into one PR.

## 5. Recap

End with a table of every item, its decision, and where it landed: a PR or
issue number, memory, or dropped.

## 6. Retro of the retro

Once the recap is agreed, run steps 1 to 5 once more on the retro
conversation itself, putting its fixes into this skill. Then stop: don't
offer a retro of that one.
