#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
  REPO,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: create-branch.ts <issue number> <short-description in kebab-case>';

const { positionals } = parseArguments(usage, { allowPositionals: true });
const [issueNumber, shortDescription, ...extraPositionals] = positionals;

if (
  !isIssueNumber(issueNumber) ||
  !shortDescription ||
  !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(shortDescription) ||
  extraPositionals.length > 0
) {
  exitWithUsage(usage);
}

exitWithResult(
  await $passthrough`gh issue develop ${issueNumber} --repo ${REPO} --name ${`i-${issueNumber}/${shortDescription}`} --base main --checkout`,
);
