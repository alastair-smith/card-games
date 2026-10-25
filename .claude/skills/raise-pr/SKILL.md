---
name: raise-pr
description: Raise a pull request for this repo — title emoji, PR body from the template, screenshots and the create-pr script. Use whenever opening a PR or updating a PR's title or description.
---

# Raise a pull request

Branches are covered by the `manage-branch` skill and commit messages by
CLAUDE.md. This skill picks up once the work is committed on an issue branch.

## Check for an existing PR

If the current branch already has an open PR, push to it and update its
description instead of opening another:

```bash
gh pr view --json number,url
```

## Title

Short and descriptive, under 70 characters, starting with one emoji from the
list in CLAUDE.md's "Commits" section. Example: `🚀 Create Yaniv components`.
CI rejects titles that don't start with one of those emoji followed by a space
and a capital letter.

Put code names in backticks — functions, components, files, skills, commands:
``🔧 Add `manage-issue` and `raise-pr` skills``. Wrap the title in single
quotes when passing it on the command line, so the shell doesn't run the
backticked text.

## Body

Fill in `.github/pull_request_template.md`:

- **Summary:** one or two plain-language sentences, or a few bullet points, on
  what the change does and why. No file names, no technical breakdown.
- **Details:** bullet points on what a reviewer needs to follow the change:
  the approach and why, anything that relies on undocumented behaviour, and
  changes to existing behaviour or tests. Leave out small facts the diff
  already shows, such as sizes, constants or where files live. Omit the
  section if there's nothing to add.
- Don't list manual follow-up steps, such as changing repo settings after
  merge. They aren't part of the PR.
- End with `Closes #123` for the issue it completes, or `Part of #123` if the
  issue has more work left.
- Strip every HTML comment (`<!-- ... -->`). The PR description becomes the
  squash-merge commit message.
- No Claude attribution or session links.

## Screenshots

For visual changes, take screenshots at desktop and mobile sizes, of a page
on the dev server (port 3000) or of a single story in Storybook (port 6006).
Start the one you need if it isn't running, with the `dev-servers` skill:

```bash
./.claude/skills/raise-pr/scripts/take-screenshots.ts --path / --name home
./.claude/skills/raise-pr/scripts/take-screenshots.ts --path / --name home-footer --scroll-to-bottom
./.claude/skills/raise-pr/scripts/take-screenshots.ts --path / --name home-page --full-page
./.claude/skills/raise-pr/scripts/take-screenshots.ts --story yaniv-scorecard--start --name scorecard
```

It saves `<name>-desktop.png` (1280×800) and `<name>-mobile.png` (390×844)
under `.pr-screenshots/<branch name>/` at the repo root (gitignored), and
prints their paths. `--name` is lowercase kebab-case, describing what's
shown.

- **Page:** the visible screen by default. Pass `--scroll-to-bottom` when the
  change is at the foot of the page, or `--full-page` for the whole page
- **Story:** just the component, framed by the felt background. The story ID
  follows `?path=/story/` in Storybook's URL. Prefer a story when the change
  is to one component, since it needs no game set up

Look at each screenshot before listing it for the user, and retake any that
shows a loading or empty state.

Screenshots can't be uploaded with `gh`, so after creating the PR, list the
files for the user to drag into the PR description themselves. Once they
have, read the description back with `gh pr view --json body` and arrange the
`<img>` tags they added into a table under a `### Screenshots` heading.

When something changed, show it before and after. Take the previous
screenshots on `main` first, named `<name>-previous`:

```md
| Description | Previous | Updated |
|:-|-|-|
| Full lobby, desktop | <img …> | <img …> |
```

Otherwise, list them:

```md
| Description | Image |
|:-|-|
| Full lobby, desktop | <img …> |
```

## Create

Push the branch first with the `manage-branch` skill's script — creating the
PR fails if it isn't on GitHub yet:

```bash
./.claude/skills/manage-branch/scripts/push-branch.ts

./.claude/skills/raise-pr/scripts/create-pr.ts --title '🔧 Add `manage-issue` skill' --body <<'EOF'
### Summary

...

### Details

- ...

Closes #123
EOF
```

Use these scripts rather than `git push` and `gh pr create`. They only push
the current issue branch to this repo, never `main` and never with force, and
only open PRs against this repo's `main`. `--body` tells `create-pr.ts` to
read the body from stdin. Pass it through a quoted heredoc as above, so
backticks in it aren't run by the shell.

When later commits change what the PR does, push them with
`push-branch.ts` and update the current branch's PR. Pass a new
title, `--body` with a new body on stdin, or both:

```bash
./.claude/skills/raise-pr/scripts/update-pr.ts --title '🔧 Add `manage-issue` skill' --body <<'EOF'
...
EOF

./.claude/skills/raise-pr/scripts/update-pr.ts --title '🔧 Add `manage-issue` skill'
```
