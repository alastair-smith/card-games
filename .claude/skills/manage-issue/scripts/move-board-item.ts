#!/usr/bin/env node
import { $ } from 'zx';
import {
  exitWithUsage,
  isIssueNumber,
  parseArguments,
} from '../../lib/script-helpers.ts';

/** Each board column's option ID in the project's Status field. */
const STATUS_OPTION_IDS = {
  Triage: 'd29ed546',
  Backlog: 'f75ad846',
  Ready: '61e4505c',
  'In progress': '47fc9ee4',
  'In review': 'df73e18b',
  Done: '98236657',
} as const satisfies Record<string, string>;

type Status = keyof typeof STATUS_OPTION_IDS;

function isStatus(value: string | undefined): value is Status {
  return value !== undefined && Object.hasOwn(STATUS_OPTION_IDS, value);
}

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

const itemId = (
  await $`gh project item-list 3 --owner alastair-smith --limit 500 --format json --jq ${`.items[] | select(.content.number == ${issueNumber}) | .id`}`
).stdout.trim();

if (!itemId) {
  console.error(`Issue #${issueNumber} isn't on the board.`);
  process.exit(1);
}

await $`gh project item-edit --project-id PVT_kwHOAWNxLc4A7LCG --id ${itemId} --field-id PVTSSF_lAHOAWNxLc4A7LCGzgvjLoQ --single-select-option-id ${STATUS_OPTION_IDS[status]}`;

console.log(`Moved #${issueNumber} to ${status}.`);
