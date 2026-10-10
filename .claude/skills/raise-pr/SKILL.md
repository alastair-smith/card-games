---
name: raise-pr
description: Raise a pull request for this repo — title emoji, PR body from the template, screenshots and gh pr create. Use whenever opening a PR or updating a PR's title or description.
---

# Raise a pull request

Branches and commit messages are covered in CLAUDE.md. This skill picks up
once the work is committed on an issue branch.

## Check for an existing PR

If the current branch already has an open PR, push to it and update its
description instead of opening another:

```bash
gh pr view --json number,url
```

## Title

Short and descriptive, under 70 characters, starting with one emoji:

| Emoji | For |
|---|---|
| 🚀 | Features, and any change to game rules or user-visible behaviour |
| 🔧 | Chores, maintenance, refactoring, tests, tooling |
| 📚 | Documentation only |
| 🐛 | Fixing something genuinely broken — not an intentional behaviour change |

Example: `🚀 Create Yaniv components`. CI rejects titles that don't start with
one of these emoji followed by a space and a capital letter.

Put code names in backticks — functions, components, files, skills, commands:
``🔧 Add `manage-issue` and `raise-pr` skills``. Wrap the title in single
quotes when passing it on the command line, so the shell doesn't run the
backticked text.

## Body

Fill in `.github/pull_request_template.md`:

- **Summary:** one or two plain-language sentences, or a few bullet points, on
  what the change does and why. No file names, no technical breakdown.
- **Details:** bullet points with the technical detail for reviewers. Omit the
  whole section if there's nothing to add.
- End with `Closes #123` for the issue it completes, or `Part of #123` if the
  issue has more work left.
- Strip every HTML comment (`<!-- ... -->`). The PR description becomes the
  squash-merge commit message.
- No Claude attribution or session links.

## Screenshots

For visual changes, save screenshots under `.pr-screenshots/<branch name>/`
at the repo root (gitignored), with descriptive names:

```bash
.pr-screenshots/i-182/show-running-scores/round-summary-mobile.png
```

Screenshots can't be uploaded with `gh`, so after creating the PR, list the
files for the user to drag into the PR description themselves.

## Create

Push the branch first — creating the PR fails if it isn't on GitHub yet:

```bash
./scripts/push-branch.sh

./scripts/create-pr.sh --title '🔧 Add `manage-issue` skill' <<'EOF'
### Summary

...

### Details

- ...

Closes #123
EOF
```

Use these scripts rather than `git push` and `gh pr create`. They only push
the current issue branch to this repo, never `main` and never with force, and
only open PRs against this repo's `main`. `create-pr.sh` reads the body from
stdin. Pass it through a quoted heredoc as above, so backticks in it aren't run
by the shell.

When later commits change what the PR does, push them with
`./scripts/push-branch.sh` and update the description:

```bash
gh pr edit 123 --body "$(cat <<'EOF'
...
EOF
)"
```
