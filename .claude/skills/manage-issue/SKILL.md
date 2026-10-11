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

Issues opened through the templates are labelled automatically.
`scripts/create-issue.sh` skips the templates, so always pass both labels
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

./scripts/create-issue.sh \
  --title "Reconnect when connection drops" \
  --label feature --label other \
  --milestone "🔁 Seamless sessions" <<'EOF'
...
EOF
```

The script always files in this repo and reads the body from stdin. Pass it
through a quoted heredoc as above, so backticks in it aren't run by the shell.
Use the script rather than `gh issue create`, which can target any repo.

Show the user the title, labels and milestone before creating, unless they
have already asked you to file it.

New issues are added to the board in Triage automatically.

## Editing issues

Pass the issue number, then only what changes. A new body replaces the old
one in full, so read the current body first and pass the whole updated text
through a quoted heredoc, as when creating:

```bash
./scripts/edit-issue.sh 123 \
  --title "Reconnect when connection drops" \
  --add-label bug --remove-label feature \
  --milestone "🔁 Seamless sessions" <<'EOF'
...
EOF
```

Every flag is optional and the labels can repeat, but pass at least one change.
Leave out the heredoc to keep the body as it is. Use the script rather than
`gh issue edit`, which can target any repo.

## Changing status

The board's built-in workflows move issues to In review when a PR is linked
and to Done when it closes. Other moves, such as Triage to Backlog or into In
progress, are manual:

```bash
./scripts/move-board-item.sh 123 "In progress"
```

The column must be one of the board columns listed above.
