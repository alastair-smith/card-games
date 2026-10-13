#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  parseArguments,
} from '../../lib/script-helpers.ts';

const { values } = parseArguments('Usage: list-board.ts [--include-done]', {
  options: { 'include-done': { type: 'boolean' } },
});
const statusFilter = values['include-done'] ? '.' : 'select(.status != "Done")';
const itemFormat =
  '"#\\(.content.number) [\\(.status)] \\(.title) — \\(.milestone.title // "no milestone")"';

exitWithResult(
  await $passthrough`gh project item-list 3 --owner alastair-smith --limit 500 --format json --jq ${`.items[] | ${statusFilter} | ${itemFormat}`}`,
);
