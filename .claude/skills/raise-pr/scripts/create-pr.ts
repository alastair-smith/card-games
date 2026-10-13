#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  getIssueBranch,
  parseArguments,
  REPO,
  readStdin,
} from '../../lib/script-helpers.ts';
import { exitUnlessValidPrTitle } from './pr-title.ts';

const usage = 'Usage: create-pr.ts --title <title> < body';

const { title } = parseArguments(usage, {
  options: { title: { type: 'string' } },
}).values;

if (!title) {
  exitWithUsage(usage);
}

exitUnlessValidPrTitle(title);
const branch = await getIssueBranch('have a PR');
const body = await readStdin('PR body', usage);

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough(
    body,
  )`gh pr create --repo ${REPO} --base main --head=${branch} --title=${title} --body-file -`,
);
