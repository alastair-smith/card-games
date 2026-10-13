#!/usr/bin/env node
import { parseArguments } from '../../lib/script-helpers.ts';
import { fetchProjectItems } from './project-board.ts';

const { values } = parseArguments('Usage: list-board.ts [--include-done]', {
  options: { 'include-done': { type: 'boolean' } },
});
const isDoneIncluded = values['include-done'] ?? false;

const items = (await fetchProjectItems()).filter(
  (item) => isDoneIncluded || item.status !== 'Done',
);

for (const item of items) {
  const number = item.content.number ?? 'draft';
  const status = item.status ?? 'no status';
  const milestone = item.milestone?.title ?? 'no milestone';
  console.log(`#${number} [${status}] ${item.title} — ${milestone}`);
}
