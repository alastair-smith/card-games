#!/usr/bin/env node
import { exitWithUsage, parseArguments } from '../../lib/script-helpers.ts';
import {
  parsePatternId,
  readWatchList,
  writeWatchList,
} from './watch-list-store.ts';

const usage = 'Usage: remove-watch-pattern.ts --id <pattern id>';

const { id } = parseArguments(usage, {
  options: { id: { type: 'string' } },
}).values;

if (!id) {
  exitWithUsage(usage);
}

const watchList = await readWatchList();
const removedPattern = parsePatternId(watchList, id);
watchList.patterns = watchList.patterns.filter(
  (pattern) => pattern !== removedPattern,
);

await writeWatchList(watchList);
console.log(`Removed pattern #${removedPattern.id}.`);
