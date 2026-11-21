---

name: review-dependency-pr
description: Check whether a dependency PR, such as one from Dependabot, is safe to merge, by reading the full release notes for every version each package bumps through and checking the notable changes against our code. Use whenever asked if a dependency update is safe, or to review one.
---

# Review a dependency PR

Dependabot cuts its PR body off partway, so the body is never enough to judge a
PR by. Read the full release notes for every package the PR bumps, not a
keyword search of the body.

## 1. List the bumps

```bash
./.claude/skills/review-dependency-pr/scripts/fetch-release-notes.ts 501
```

It compares the PR's lockfile with the commit it branched from on GitHub, not
the local checkout, so bumps already on `main` don't show up. It lists each direct dependency the PR
bumps, its old and new versions, where it's used and its GitHub repo.

## 2. Read every package's notes

```bash
./.claude/skills/review-dependency-pr/scripts/fetch-release-notes.ts 501 --package next
```

It prints the GitHub release notes for every version between the old and new
pins, newest first. Run it for each package in the list and read all of it:

- Where it names versions without full notes, read their entries in the repo's
  `CHANGELOG.md` (e.g. with `gh api` and `Accept: application/vnd.github.raw`)
- Where a release only says it updated a core package, such as
  `@tanstack/react-query` updating `@tanstack/query-core`, read the core
  package's notes for the same versions too
- Packages released together from one repo, such as OpenTelemetry's, share
  notes, so read those once

## 3. Check the notable changes against the code

For each breaking change, deprecation, behaviour change or new requirement
(such as a minimum Node version), find whether the app uses what it touches
and what changes for us. Check it in the code or the installed package rather
than reasoning about it, e.g. which headers a response sets.

Also skim the lockfile diff (`gh pr diff`) for transitive packages that change
too, and check CI with `gh pr checks`.

## 4. Report

Say whether it's safe to merge, then list what affects the app and how you
checked it, what's breaking but doesn't apply and why, and anything worth
following up later. Say which notes you couldn't find or read.
