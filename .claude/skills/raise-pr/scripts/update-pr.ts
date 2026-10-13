#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  getIssueBranch,
  parseArguments,
  REPO,
  readOptionalStdin,
} from '../../lib/script-helpers.ts';
import { assertPrTitle } from './pr-title.ts';

const usage = 'Usage: update-pr.ts [--title <title>] [< body]';

const { title } = parseArguments(usage, {
  options: { title: { type: 'string' } },
}).values;

if (title === '') {
  exitWithUsage(usage);
}

if (title) {
  assertPrTitle(title);
}

const branch = await getIssueBranch('have a PR');
const body = readOptionalStdin();

const editArgs = [
  ...(title ? [`--title=${title}`] : []),
  ...(body ? ['--body-file', '-'] : []),
];

if (editArgs.length === 0) {
  console.error('Pass a new title, a new body on stdin, or both.');
  exitWithUsage(usage);
}

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough({
    input: body,
  })`gh pr edit ${branch} --repo ${REPO} ${editArgs}`,
);
