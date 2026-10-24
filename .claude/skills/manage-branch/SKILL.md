---
name: manage-branch
description: Create a branch for a GitHub issue in this repo, and push it. Use before starting any work that changes files, and whenever pushing commits.
---

# Manage branches

All work that changes files happens on a branch for an issue. CLAUDE.md
covers finding or filing the issue first.

## Creating a branch

```bash
./.claude/skills/manage-branch/scripts/create-branch.ts 123 short-description
```

The script runs `gh issue develop`, so the branch is linked to the issue on
GitHub. A branch created with plain `git checkout -b` and given the same name
is not linked.

It names the branch `i-<issue number>/<short-description>`, branches from
`main` and checks it out. The description must be lowercase kebab-case. It
then moves the issue to In progress on the project board.

If the issue already has an open PR, don't create a branch. Switch to that
PR's branch instead.

## Pushing

```bash
./.claude/skills/manage-branch/scripts/push-branch.ts
```

It takes no arguments and pushes the current branch to a branch of the same
name on GitHub, setting it as the upstream. It refuses to push `main` or a
detached HEAD, and never force-pushes. Use it rather than `git push`.
