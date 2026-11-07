#!/usr/bin/env node
import {
  exitWithUsage,
  parseArguments,
  readStdin,
} from '../../lib/script-helpers.ts';
import {
  parsePrNumber,
  parseSessionId,
  readWatchList,
  today,
  writeWatchList,
} from './watch-list-store.ts';

const usage =
  'Usage: add-watch-pattern.ts --session <session id> [--pr <number>] --pattern  (pattern read from stdin)';

const {
  session,
  pr,
  pattern: isPatternPiped = false,
} = parseArguments(usage, {
  options: {
    session: { type: 'string' },
    pr: { type: 'string' },
    pattern: { type: 'boolean' },
  },
}).values;

if (!isPatternPiped) {
  exitWithUsage(usage);
}

const sessionId = parseSessionId(session);
const prNumber = pr === undefined ? undefined : parsePrNumber(pr, '--pr');
const pattern = await readStdin('pattern', usage);
const watchList = await readWatchList();

const id =
  Math.max(
    0,
    ...watchList.patterns.map((watchedPattern) => watchedPattern.id),
  ) + 1;
watchList.patterns.push({
  id,
  pattern,
  sightings: [
    { date: today(), session: sessionId, ...(prNumber && { pr: prNumber }) },
  ],
  retrosWithout: 0,
});

await writeWatchList(watchList);
console.log(`Added pattern #${id}.`);
