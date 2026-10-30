#!/usr/bin/env node
import {
  $capture,
  $passthrough,
  exitIfFailed,
  exitWithError,
  exitWithResult,
  getIssueBranch,
  parseArguments,
} from '../../lib/script-helpers.ts';

parseArguments('Usage: update-branch.ts', {});

await getIssueBranch();

const status = await $capture`git status --porcelain`;
exitIfFailed(status);
if (status.stdout.trim()) {
  exitWithError('Commit or stash your changes before merging main.');
}

exitIfFailed(await $passthrough()`git fetch origin main`);

// A merge rather than a rebase, so the branch never needs a force-push. On a
// conflict git stops and leaves it to be resolved
exitWithResult(await $passthrough()`git merge --no-edit origin/main`);
