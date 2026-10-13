#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
  REPO,
  readRequiredStdin,
} from '../../lib/script-helpers.ts';

const usage = 'Usage: close-issue.ts <issue number> < comment';

const { positionals } = parseArguments(usage, { allowPositionals: true });
const [issueNumber, ...extraPositionals] = positionals;

if (!isIssueNumber(issueNumber) || extraPositionals.length > 0) {
  exitWithUsage(usage);
}

const comment = readRequiredStdin('closing comment', usage);

// The --flag=value form stops a comment that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough`gh issue close ${issueNumber} --repo ${REPO} --comment=${comment}`,
);
