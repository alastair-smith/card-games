---
name: manage-issue
description: Find, create, update or close GitHub issues for this repo, including labels, milestones and project board status. Use whenever filing an issue (even a quick follow-up in the middle of other work), looking up existing issues, closing one that was done without a linked PR, or checking what's on the board.
---

# Manage issues

Issues live in `alastair-smith/card-games` and are tracked on project 3
("Card Games App").

## Labels

Every issue has exactly one type label and one area label.

| Type | For |
|---|---|
| `bug` | Something isn't working |
| `feature` | Something new, or an improvement to something that exists |
| `chore` | Maintenance, tooling, infrastructure, refactoring |
| `documentation` | Docs only |
| `question` | Asking for help |

| Area | For |
|---|---|
| `yaniv` | The Yaniv game |
| `lobby` | The game lobby |
| `home page` | The home page |
| `other` | Anything else, including dev tooling and infrastructure |

Issues opened through the templates are labelled automatically.
`create-issue.ts` skips the templates, so always pass both labels
yourself. Quote `home page` because of the space: `--label "home page"`.

## Finding issues

Search before creating, so you don't file a duplicate:

```bash
gh issue list --search "reconnect" --state all
gh issue list --label yaniv --label bug
gh issue list --milestone "📖 Overhaul documentation"
```

To read one issue in full, including its comments, use `--json`. Without a
terminal, `gh issue view 123 --comments` prints only the comments, so an issue
with none prints nothing:

```bash
gh issue view 123 --json number,title,state,labels,milestone,body,comments
```

To see board status alongside milestones (Done items are left out unless you
pass `--include-done`):

```bash
./.claude/skills/manage-issue/scripts/list-board.ts
./.claude/skills/manage-issue/scripts/list-board.ts --include-done
```

Board columns: Triage, Backlog, Ready, In progress, In review, Done.

## Creating issues

- **Title:** short, plain-language, sentence case, no emoji, e.g. "Reconnect
  when connection drops".
- **Body:** a sentence or two on what and why, then bullet points if the
  change has several parts. No headings for small issues. Changes that are
  only loosely related get an issue each, linked to one another where it
  helps.
- **Links:** `#123` links to this repo, so write issues, PRs and discussions
  in other repos as full URLs.
- **Labels:** one type and one area, as above.
- **Milestone:** put it under the milestone it helps ship. Milestones are
  outcome-named deliverables, e.g. "📝 Play Yaniv games in person". If none
  fits, propose a new outcome-named milestone to the user, and once they
  agree, create it with `create-milestone.ts` (below). Don't create an
  umbrella issue instead. `--milestone` needs the exact title, emoji
  included, so copy it from the listing below.
- **Completed milestones:** don't add new work to a milestone whose issues
  are all closed, even if the milestone itself is still open. Propose a new
  milestone for the next outcome instead. Delivering in slices is fine; a
  milestone that keeps growing never finishes.
- **Bugs** don't need a milestone, since they often don't belong to any
  deliverable. Only add one when an existing milestone clearly fits, e.g. a
  bug in a feature that milestone is still delivering. Never propose a new
  milestone just to hold a bug.

```bash
./.claude/skills/manage-issue/scripts/list-milestones.ts

./.claude/skills/manage-issue/scripts/create-issue.ts \
  --title "Reconnect when connection drops" \
  --label feature --label other \
  --milestone "🔁 Seamless sessions" --body <<'EOF'
...
EOF
```

The script always files in this repo. `--body` tells it to read the body from
stdin, which it only does when that flag is passed. Pass the body through a
quoted heredoc as above, so backticks in it aren't run by the shell.
Use the script rather than `gh issue create`, which can target any repo.

Show the user the title, labels and milestone before creating, unless they
have already asked you to file it.

New issues are added to the board in Triage automatically.

## Creating milestones

Only once the user has agreed the title and description:

```bash
./.claude/skills/manage-issue/scripts/create-milestone.ts \
  --title "🔁 Seamless sessions" --description <<'EOF'
Let a group keep playing together without rejoining or re-entering their details.
EOF
```

It creates the milestone in this repo and prints its URL. It isn't
allowlisted, so it asks the user for approval each time; new milestones are
rare enough to warrant that.

## Editing issues

Pass the issue number, then only what changes. To change the body, pass
`--body` and the new body through a quoted heredoc, as when creating. It
replaces the old body in full, so read the current body first and pass the
whole updated text:

```bash
./.claude/skills/manage-issue/scripts/edit-issue.ts 123 \
  --title "Reconnect when connection drops" \
  --add-label bug --remove-label feature \
  --milestone "🔁 Seamless sessions" --body <<'EOF'
...
EOF
```

Every flag is optional and the labels can repeat, but pass at least one change.
Use the script rather than `gh issue edit`, which can target any repo.

## Changing status

The board's built-in workflows move issues to In review when a PR is linked
and to Done when it closes. Other moves, such as Triage to Backlog or into In
progress, are manual:

```bash
./.claude/skills/manage-issue/scripts/move-board-item.ts 123 "In progress"
```

The column must be one of the board columns listed above.

## Closing issues

A PR that says `Closes #123` closes its issue when it merges. Close one by
hand only when the work was merged without that link, e.g. a Dependabot PR
that does what an issue describes.

Every closed issue gets a comment saying which PR did the work. The script
requires `--comment` and reads the comment from stdin, and refuses to close
the issue without one:

```bash
./.claude/skills/manage-issue/scripts/close-issue.ts 123 --comment <<'EOF'
Done in #456, which bumps ioredis to 6.0.0.
EOF
```

The script always targets this repo. Use it rather than `gh issue close`,
which can target any repo and doesn't need a comment.
