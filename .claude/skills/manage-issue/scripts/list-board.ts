#!/usr/bin/env node
import { parseArguments, REPO_FULL_NAME } from '../../lib/script-helpers.ts';
import { fetchProjectItems, type ProjectItem } from './project-board.ts';

/** `#123` for this repo's issues, `owner/name#123` for another repo's. */
function formatReference(item: ProjectItem): string {
  const { number, repository } = item.content;

  if (number === undefined || number === null) {
    return 'draft';
  }

  return repository && repository !== REPO_FULL_NAME
    ? `${repository}#${number}`
    : `#${number}`;
}

const { values } = parseArguments('Usage: list-board.ts [--include-done]', {
  options: { 'include-done': { type: 'boolean' } },
});
const isDoneIncluded = values['include-done'] ?? false;

const items = (await fetchProjectItems()).filter(
  (item) => isDoneIncluded || item.status !== 'Done',
);

for (const item of items) {
  const status = item.status ?? 'no status';
  const milestone = item.milestone?.title ?? 'no milestone';
  console.log(
    `${formatReference(item)} [${status}] ${item.title} — ${milestone}`,
  );
}
