#!/usr/bin/env node
import {
  $capture,
  exitIfFailed,
  exitWithUsage,
  isIssueNumber,
  parseArguments,
} from '../../lib/script-helpers.ts';
import {
  fetchProjectItems,
  isStatus,
  PROJECT_ID,
  STATUS_FIELD_ID,
  STATUS_OPTION_IDS,
} from './project-board.ts';

const usage = `Usage: move-board-item.ts <issue number> <${Object.keys(STATUS_OPTION_IDS).join('|')}>`;

const { positionals } = parseArguments(usage, { allowPositionals: true });
const [issueNumber, status, ...extraPositionals] = positionals;

if (
  !isIssueNumber(issueNumber) ||
  !isStatus(status) ||
  extraPositionals.length > 0
) {
  exitWithUsage(usage);
}

const item = (await fetchProjectItems()).find(
  (projectItem) => projectItem.content.number === Number(issueNumber),
);

if (!item) {
  console.error(`Issue #${issueNumber} isn't on the board.`);
  process.exit(1);
}

exitIfFailed(
  await $capture`gh project item-edit --project-id ${PROJECT_ID} --id ${item.id} --field-id ${STATUS_FIELD_ID} --single-select-option-id ${STATUS_OPTION_IDS[status]}`,
);

console.log(`Moved #${issueNumber} to ${status}.`);
