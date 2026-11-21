#!/usr/bin/env node
import {
  exitWithUsage,
  parseArguments,
  readStdin,
} from '../../lib/script-helpers.ts';
import {
  parseLabels,
  parsePrNumber,
  parseSessionId,
  readWatchList,
  today,
  writeWatchList,
} from './watch-list-store.ts';

const usage =
  'Usage: add-watch-pattern.ts --session <session id> [--pr <number>] --label <label> [--label …] --pattern  (pattern read from stdin)';

const {
  session,
  pr,
  label: labelValues = [],
  pattern: isPatternPiped = false,
} = parseArguments(usage, {
  options: {
    session: { type: 'string' },
    pr: { type: 'string' },
    label: { type: 'string', multiple: true },
    pattern: { type: 'boolean' },
  },
}).values;

if (!isPatternPiped) {
  exitWithUsage(usage);
}

const sessionId = parseSessionId(session);
const prNumber = pr === undefined ? undefined : parsePrNumber(pr, '--pr');
const watchList = await readWatchList();
const labels = parseLabels(watchList, labelValues);
const pattern = await readStdin('pattern', usage);

const id =
  Math.max(
    0,
    ...watchList.patterns.map((watchedPattern) => watchedPattern.id),
  ) + 1;
watchList.patterns.push({
  id,
  pattern,
  labels,
  sightings: [
    { date: today(), session: sessionId, ...(prNumber && { pr: prNumber }) },
  ],
  retrosWithout: 0,
  retrosWithoutInLabels: 0,
});

await writeWatchList(watchList);
console.log(`Added pattern #${id}.`);
