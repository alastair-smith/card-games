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
import { getAttachArguments } from './attachments.ts';
import { exitUnlessValidPrTitle } from './pr-title.ts';

const usage =
  'Usage: update-pr.ts [--title <title>] [--attach <screenshot>]... [--body < body]';

const {
  title,
  body: isBodyPassed = false,
  attach: attachments = [],
} = parseArguments(usage, {
  options: {
    title: { type: 'string' },
    body: { type: 'boolean' },
    attach: { type: 'string', multiple: true },
  },
}).values;

if (title === '' || (!title && !isBodyPassed && attachments.length === 0)) {
  exitWithUsage(usage);
}

if (title) {
  exitUnlessValidPrTitle(title);
}

const branch = await getIssueBranch();
const attachArguments = await getAttachArguments(attachments, branch);
const body = isBodyPassed ? await readStdin('PR body', usage) : '';

const editArguments = [
  ...(title ? [`--title=${title}`] : []),
  ...(body ? ['--body-file', '-'] : []),
  ...attachArguments,
];

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough(
    body,
  )`gh pr edit ${branch} --repo ${REPO} ${editArguments}`,
);
