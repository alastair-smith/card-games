---
name: manage-issue
description: Find, create or update GitHub issues for this repo, including labels, milestones and project board status. Use whenever filing an issue (even a quick follow-up in the middle of other work), looking up existing issues, or checking what's on the board.
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

Issues opened through the templates are labelled automatically. `gh issue
create` skips the templates, so always pass both labels yourself. Quote
`home page` because of the space: `--label "home page"`.

## Finding issues

Search before creating, so you don't file a duplicate:

```bash
gh issue list --search "reconnect" --state all
gh issue list --label yaniv --label bug
gh issue list --milestone "📖 Overhaul documentation"
```

To see board status alongside milestones (Done items are left out unless you
pass `--include-done`):

```bash
./scripts/list-board.sh
./scripts/list-board.sh --include-done
```

Board columns: Triage, Backlog, Ready, In progress, In review, Done.

## Creating issues

- **Title:** short, plain-language, sentence case, no emoji, e.g. "Reconnect
  when connection drops".
- **Body:** a sentence or two on what and why, then bullet points if there
  are several parts. No headings for small issues.
- **Labels:** one type and one area, as above.
- **Milestone:** put it under the milestone it helps ship. Milestones are
  outcome-named deliverables, e.g. "📝 Play Yaniv games in person". If none
  fits, propose a new outcome-named milestone to the user. Don't create an
  umbrella issue instead. `--milestone` needs the exact title, emoji
  included, so copy it from the listing below.

```bash
./scripts/list-milestones.sh

gh issue create \
  --title "Reconnect when connection drops" \
  --body "..." \
  --label feature --label other \
  --milestone "🔁 Seamless sessions"
```

Show the user the title, labels and milestone before creating, unless they
have already asked you to file it.

New issues are added to the board in Triage automatically.

## Changing status

The board's built-in workflows move issues to In review when a PR is linked
and to Done when it closes. Other moves, such as Triage to Backlog or into In
progress, are manual:

```bash
./scripts/move-board-item.sh 123 "In progress"
```

The column must be one of the board columns listed above.
