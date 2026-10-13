#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  parseArguments,
  REPO,
  readStdin,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: create-issue.ts --title <title> --label <label>... [--milestone <milestone>] < body';

const { values } = parseArguments(usage, {
  options: {
    title: { type: 'string' },
    label: { type: 'string', multiple: true },
    milestone: { type: 'string' },
  },
});
const { title, label: labels = [], milestone } = values;

if (!title || labels.length === 0 || labels.includes('') || milestone === '') {
  exitWithUsage(usage);
}

const body = await readStdin('issue body', usage);
const labelArguments = labels.map((label) => `--label=${label}`);
const milestoneArguments = milestone ? [`--milestone=${milestone}`] : [];

// The --flag=value form stops a value that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough(
    body,
  )`gh issue create --repo ${REPO} --title=${title} --body-file - ${labelArguments} ${milestoneArguments}`,
);
