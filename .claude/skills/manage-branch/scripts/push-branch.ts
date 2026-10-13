#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  getIssueBranch,
  parseArguments,
} from '../../lib/script-helpers.ts';

parseArguments('Usage: push-branch.ts', {});

const branch = await getIssueBranch('be pushed');

exitWithResult(
  await $passthrough()`git push --set-upstream origin ${`HEAD:refs/heads/${branch}`}`,
);
