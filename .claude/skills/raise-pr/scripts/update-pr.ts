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

const usage = 'Usage: update-pr.ts [--title <title>] [--body < body]';

const { title, body: isBodyPiped = false } = parseArguments(usage, {
  options: { title: { type: 'string' }, body: { type: 'boolean' } },
}).values;

if (title === '' || (!title && !isBodyPiped)) {
  exitWithUsage(usage);
}

if (title) {
  exitUnlessValidPrTitle(title);
}

const branch = await getIssueBranch('have a PR');
const body = isBodyPiped ? await readStdin('PR body', usage) : '';

const editArguments = [
  ...(title ? [`--title=${title}`] : []),
  ...(body ? ['--body-file', '-'] : []),
];

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough(
    body,
  )`gh pr edit ${branch} --repo ${REPO} ${editArguments}`,
);
