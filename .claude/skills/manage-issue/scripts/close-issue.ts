#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
  REPO,
  readStdin,
} from '../../lib/script-helpers.ts';

const usage = 'Usage: close-issue.ts <issue number> --comment < comment';

const { values, positionals } = parseArguments(usage, {
  allowPositionals: true,
  options: { comment: { type: 'boolean' } },
});
const [issueNumber, ...extraPositionals] = positionals;

if (
  !isIssueNumber(issueNumber) ||
  extraPositionals.length > 0 ||
  !values.comment
) {
  exitWithUsage(usage);
}

const comment = await readStdin('closing comment', usage);

// The --flag=value form stops a comment that starts with a dash from being read as another flag
exitWithResult(
  await $passthrough()`gh issue close ${issueNumber} --repo ${REPO} --comment=${comment}`,
);
