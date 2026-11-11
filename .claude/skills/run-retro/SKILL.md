---

name: run-retro
description: Run a retrospective on the current session, or a past one. Find corrections worth writing down, approval prompts to remove, commands worth scripting and process friction, keep only the few that clear a strict bar, agree each fix with the user, then run a retro of the retro if the retro itself was corrected. Use when the user asks for a retro or to review how a session went.
---

# Run a retro

The aim is a workflow where most retros find nothing to change. Every point
raised costs the user a decision and usually an issue or PR, so raise only
what clears the bar in step 3, and say plainly when nothing does.

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

Look in that list for network commands such as `curl` or `wget`. For each,
suggest the tool that should have been used, such as the `check-urls` skill
for our own sites or web fetch for third-party docs, or a new script or
narrow allow rule if neither fits.

Then read the watch list, the patterns earlier retros chose to watch, and
check whether each happened again this session:

```bash
./.claude/skills/run-retro/scripts/show-watch-list.ts
```

A pattern that happened again is now on its second sighting and a candidate
for a change in step 3. Record which ones did, with the PR it happened in,
along with the PRs the session's work went into. This starts the retro's log
entry and adds one to the count of retros without it for every other pattern:

```bash
./.claude/skills/run-retro/scripts/record-watch-retro.ts --session <id> --pr 400 --seen 12:400
```

For a retro of several sessions, pass `--session` once for each, and name the
session each sighting came from, as in `--seen 12:400@<id>`. Edit
`watch-list.json` only through these scripts.

## 2. Sort into categories

1. **Corrections** worth turning into a rule
2. **Questioned claims**, and what checking first would have looked like
3. **Approval prompts:** for each, use an approved command that already
   exists, allowlist it if it's always safe, give it a strict script, or
   leave it prompting if each run deserves a look
4. **Repeated commands** worth a script
5. **Process friction:** how the work was done, not the code
6. **Tool economy:** calls that cost more than they needed to, such as
   full-page screenshots, measurement loops, or output too long to read
7. **Information access:** something you needed but couldn't see, such as
   dev server logs
8. **Navigation:** time spent finding the right file, which a pointer would
   have saved

## 3. Decide what's worth a change

Keep a point only if it cost something this session:

- The user corrected you, or asked for something you'd left out
- Work had to be redone
- The same approval prompt came up repeatedly

A mistake you caught yourself, or a reviewer's comment fixed in one round,
doesn't count. Then sort what's left:

- **Existing rule not followed:** if `CLAUDE.md` or a skill already covered
  it clearly, don't add words. Name the rule in the recap, put it on the
  watch list, and change nothing. Reword a rule only where it was genuinely
  unclear. If the watch list shows the same rule broken before, the rule
  isn't working: propose replacing it with an automated check, or deleting
  it. `CLAUDE.md` loads into every conversation, so removing a rule that
  doesn't change behaviour is progress too.
- **First sighting:** put it on the watch list rather than writing a rule. A
  correction the user stated outright, such as "push and let CI run them", is
  the exception: it can become a rule straight away.
- **Second sighting**, from the watch list: a candidate for a change.

Rank the candidates by what they cost: user corrections first, then redone
work, then approval prompts. Propose at most 3 changes; the rest go on the
watch list or are dropped, and the recap says which. Zero is a fine result:
say "nothing worth changing" rather than looking for something to raise.

Don't file issues for ideas a retro turns up, such as new tooling. Note them
in the recap, and file one only if the user asks or the same friction comes
back in a later retro.

## 4. Decide where each fix belongs

Check what reads a file, and when, before proposing it. For example, a skill
is read only when its workflow starts, so a rule about how to build something
belongs in `CLAUDE.md`, which every conversation reads, not in `raise-pr`,
which is read only once the work is done.

Before proposing a fix, search open issues for one that already covers it,
and before proposing a script for a command, check whether the allowlist
already allows that command or another that does the same job.

Prefer a check over a rule. If a lint rule, a type, a test or CI could catch
the mistake, propose that check, extending one the repo already runs where
possible (see the commands in `CLAUDE.md` and `.github/workflows/ci.yml`), rather than
writing an instruction. A check stops the mistake recurring without adding
to what every conversation has to read.

For a manual step that's slow or risky, offer both kinds of fix side by side:
a script that makes the step safer, and a change of setup that removes the
step, such as a running copy of `main` to screenshot against instead of
swapping files.

| Fix                                                                                                                                                    | Where                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| A mistake a lint rule, type, test or CI check could catch                                                                                              | That check, rather than a written rule                                              |
| Code, testing or workflow rule for the whole repo                                                                                                      | `CLAUDE.md`, kept short: no one-off review notes                                    |
| How a workflow such as raising a PR runs                                                                                                               | That skill's `SKILL.md`                                                             |
| A command that's repeated or needs approval                                                                                                            | A skill script, allowlisted unless each run should ask                              |
| A read-only command that's always safe, or a docs site whose content only its maintainers publish (not GitHub, npm or other hosts of anyone's content) | The allowlist in `.claude/settings.json`                                            |
| Context about one piece of code                                                                                                                        | A comment there                                                                     |
| A short-term learning, or a personal preference that isn't about how this repo works                                                                   | Memory, as a last resort: prefer `CLAUDE.md` or a skill wherever the fix fits there |

Draft rules as the general principle, not as a description of the incident
that prompted them. Add a concrete example only where the rule would
otherwise be unclear, and say what it doesn't cover where it could be read
too widely.

When a correction says something was too much or too little, aim the rule at
the specific excess or gap the user named, not at its opposite. A rule against
unimportant facts shouldn't become a rule against detail.

Before drafting, find what actually went wrong, not only what the user saw.
For example, if work was left out and the user then asked for it, check
whether it was left out without being looked at, rather than drafting
"ask first".

## 5. Go through it with the user

List the proposed changes, one line each, along with what you set aside in
step 3 and why (existing rule, first sighting, over the cap), so the user can
pull one back. Then detail one change at a time and don't move on until it
has a decision: do it, skip it, or watch it. Ask for the decisions with the
AskUserQuestion tool, offering those as options plus "Explain this point
further". Its questions show apart from your message, so put the problem and
the proposed change in plain words in the question itself. Keep each question
to one problem and its fix, and leave bookkeeping such as watch-list counts
out of it. When asked to explain further, explain again more simply; don't
drop a point because it was hard to explain.

Changes follow the usual issue and branch rules; put all of a retro's
changes in one PR. Before filing the issue for them, show its title, labels
and milestone, as the `manage-issue` skill asks.

## 6. Recap

End with a table of every item, its decision, and where it landed: the PR,
memory, the watch list, an existing rule, or dropped.

Update the watch list in the retro's PR. Add each pattern being watched, with
the PR it happened in, and remove any that got a fix or that the user agrees
to drop. `show-watch-list.ts` marks those that have gone 10 retros without
recurring:

```bash
./.claude/skills/run-retro/scripts/add-watch-pattern.ts --session <id> --pr 400 --pattern <<'EOF'
…
EOF
./.claude/skills/run-retro/scripts/remove-watch-pattern.ts --id 7
```

Then finish the retro's log entry with the points raised and the changes
made, and the retro's PR if it has one. Issues filed for ideas count as
changes:

```bash
./.claude/skills/run-retro/scripts/log-retro.ts --session <id> --points 3 --fix-pr 405 --changes <<'EOF'
1 CI check and 1 rule in `run-retro`; 1 issue (#403) filed
EOF
```

`show-watch-list.ts --log` lists past retros. If the changes aren't trending
towards zero, say so.

## 7. Retro of the retro

Only if the user corrected how the retro ran, run steps 1 to 6 once more on
the retro conversation itself, putting its fixes into this skill. If the
retro ran without corrections, skip this step. Either way, stop there: don't
offer a retro of that one.

It's the same session, so pass `--retro-of-retro` to `record-watch-retro.ts`
and `log-retro.ts`. They add its sightings, points and changes to the retro's
entry, rather than counting the retro again or replacing its result.
