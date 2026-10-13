#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
  REPO,
  readBodyIfPassed,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: edit-issue.ts <issue number> [--title <title>] [--add-label <label>]... [--remove-label <label>]... [--milestone <milestone>] [--body < body]';

const { values, positionals } = parseArguments(usage, {
  allowPositionals: true,
  options: {
    title: { type: 'string' },
    'add-label': { type: 'string', multiple: true },
    'remove-label': { type: 'string', multiple: true },
    milestone: { type: 'string' },
    body: { type: 'boolean' },
  },
});
const [issueNumber, ...extraPositionals] = positionals;
const {
  title,
  'add-label': addLabels = [],
  'remove-label': removeLabels = [],
  milestone,
  body: isBodyPassed = false,
} = values;

if (
  !isIssueNumber(issueNumber) ||
  extraPositionals.length > 0 ||
  title === '' ||
  milestone === '' ||
  addLabels.includes('') ||
  removeLabels.includes('')
) {
  exitWithUsage(usage);
}

const body = await readBodyIfPassed(isBodyPassed, 'issue body', usage);

const editArguments = [
  ...(title ? [`--title=${title}`] : []),
  ...addLabels.map((label) => `--add-label=${label}`),
  ...removeLabels.map((label) => `--remove-label=${label}`),
  ...(milestone ? [`--milestone=${milestone}`] : []),
  ...(body ? ['--body-file', '-'] : []),
];

if (editArguments.length === 0) {
  console.error('Pass at least one change: a flag, or --body with a new body.');
  exitWithUsage(usage);
}

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough(
    body,
  )`gh issue edit ${issueNumber} --repo ${REPO} ${editArguments}`,
);
