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
- **Details:** bullet points on what a reviewer couldn't work out from the
  diff: why this approach over another, anything that relies on undocumented
  behaviour, and changes to existing behaviour. Leave out what the diff
  already shows, such as a new lookup table, renamed tests or a tweak to an
  existing test. A small fix usually needs only the Summary and the `Closes`
  line, so omit the section when there's nothing to add.
- Don't list manual follow-up steps, such as changing repo settings after
  merge. They aren't part of the PR. When asked to include a one-off command,
  such as a data clean-up, give the command only, not how to connect to or
  configure the hosting.
- End with `Closes #123` for the issue it completes, or `Part of #123` if the
  issue has more work left.
- Strip every HTML comment (`<!-- ... -->`). The PR description becomes the
  squash-merge commit message.
- No Claude attribution or session links.

## Screenshots

For visual changes, take screenshots at desktop and mobile sizes with the
`take-screenshots` skill.

Screenshot every state the change affects. When no story shows one, such as
another player's step or a message that only appears mid-turn, add a story
for it (committed with 🔧) and capture that, rather than leaving the
screenshot out. When the change affects text that varies, such as a message
for each step or for each player, show every variant, at the worst case such
as the longest name. A story that stacks the variants keeps that to one
screenshot.

If a state still can't be captured, say what's missing and suggest an issue
to add it, rather than taking the screenshot another way.

Put them in a table under a `### Screenshots` heading at the end of the body,
above `Closes #123`. Reference each one by the path the script printed, and
pass that same path to `--attach` (below), which uploads it and points the
reference at the upload. Give each state a row, with desktop and mobile as
columns, and write the alt text in the reference:

```md
| Description | Desktop                                                               | Mobile                                                              |
| :---------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Full lobby  | ![Full lobby, desktop](.pr-screenshots/i-123/lobby/lobby-desktop.png) | ![Full lobby, mobile](.pr-screenshots/i-123/lobby/lobby-mobile.png) |
```

When something changed, show it before and after, as a row each. Take the
previous screenshots on the issue branch before changing anything, since the
script doesn't run on `main`, named `<name>-previous`:

```md
| Description          | Desktop                            | Mobile                            |
| :------------------- | ---------------------------------- | --------------------------------- |
| Full lobby, previous | ![…](…/lobby-previous-desktop.png) | ![…](…/lobby-previous-mobile.png) |
| Full lobby, updated  | ![…](…/lobby-desktop.png)          | ![…](…/lobby-mobile.png)          |
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

Pass `--attach` once per screenshot the body references. It only takes PNGs
from this branch's `.pr-screenshots/` folder, so no other local file can be
uploaded:

```bash
./.claude/skills/raise-pr/scripts/create-pr.ts --title '🚀 Show the lobby' \
  --attach .pr-screenshots/i-123/lobby/lobby-desktop.png \
  --attach .pr-screenshots/i-123/lobby/lobby-mobile.png --body <<'EOF'
...
EOF
```

Read the description back with `gh pr view --json body` and check every
reference now points at a `github.com/user-attachments` URL.

When the PR changes the app, the Deploy Stories workflow comments the Storybook
preview's status on it, with a link once the build deploys. To point a reviewer at a changed
story there, use the `link-stories` skill's "Hosted stories" section rather
than linking `localhost`.

When later commits change what the PR does, push them with
`push-branch.ts` and update the current branch's PR. Pass a new
title, `--body` with a new body on stdin, or both, plus `--attach` for any
screenshots the new body references. A body that keeps screenshots already
uploaded keeps their `github.com/user-attachments` URLs, so read it back
first rather than writing the old paths again:

```bash
./.claude/skills/raise-pr/scripts/update-pr.ts --title '🔧 Add `manage-issue` skill' --body <<'EOF'
...
EOF

./.claude/skills/raise-pr/scripts/update-pr.ts --title '🔧 Add `manage-issue` skill'
```

## Addressing review comments

`gh pr view --json reviews,comments` shows each review's summary but not the
comments left on lines of code. List those, with their file, line and
replies:

```bash
./.claude/skills/raise-pr/scripts/list-review-comments.ts 123
```

A comment on code that has since changed says `outdated` and gives the line
it was left on.
