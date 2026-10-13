#!/usr/bin/env node
import {
  $capture,
  exitIfFailed,
  exitWithError,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
} from '../../lib/script-helpers.ts';
import {
  fetchProjectItems,
  isRepoIssue,
  isStatus,
  PROJECT_ID,
  STATUS_FIELD_ID,
  STATUS_OPTION_IDS,
  statusSchema,
} from './project-board.ts';

const usage = `Usage: move-board-item.ts <issue number> <${statusSchema.options.join('|')}>`;

const { positionals } = parseArguments(usage, { allowPositionals: true });
const [issueNumber, status, ...extraPositionals] = positionals;

if (
  !isIssueNumber(issueNumber) ||
  !isStatus(status) ||
  extraPositionals.length > 0
) {
  exitWithUsage(usage);
}

const item = (await fetchProjectItems()).find((projectItem) =>
  isRepoIssue(projectItem, issueNumber),
);

if (!item) {
  exitWithError(`Issue #${issueNumber} isn't on the board.`);
}

exitIfFailed(
  await $capture`gh project item-edit --project-id ${PROJECT_ID} --id ${item.id} --field-id ${STATUS_FIELD_ID} --single-select-option-id ${STATUS_OPTION_IDS[status]}`,
);

console.log(`Moved #${issueNumber} to ${status}.`);
