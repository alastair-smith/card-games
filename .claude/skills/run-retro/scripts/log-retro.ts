#!/usr/bin/env node
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
  readStdin,
} from '../../lib/script-helpers.ts';
import {
  findRetro,
  parsePrNumber,
  parseSessionId,
  readWatchList,
  writeWatchList,
} from './watch-list-store.ts';

const usage =
  'Usage: log-retro.ts --session <session id> --points <count> [--retro-of-retro-points <count>] [--fix-pr <number>] --changes  (changes made read from stdin)';

const COUNT = /^(0|[1-9][0-9]*)$/;

const {
  session,
  points,
  'retro-of-retro-points': retroOfRetroPoints = '0',
  'fix-pr': fixPr,
  changes: isChangesPiped = false,
} = parseArguments(usage, {
  options: {
    session: { type: 'string' },
    points: { type: 'string' },
    'retro-of-retro-points': { type: 'string' },
    'fix-pr': { type: 'string' },
    changes: { type: 'boolean' },
  },
}).values;

if (!points || !isChangesPiped) {
  exitWithUsage(usage);
}

for (const [option, value] of [
  ['--points', points],
  ['--retro-of-retro-points', retroOfRetroPoints],
] as const) {
  if (!COUNT.test(value)) {
    exitWithError(`${option} must be a count such as 3, not '${value}'.`);
  }
}

const sessionId = parseSessionId(session);
const fixPrNumber =
  fixPr === undefined ? undefined : parsePrNumber(fixPr, '--fix-pr');
const changesMade = await readStdin('changes made', usage);
const watchList = await readWatchList();

const retro = findRetro(watchList, sessionId);
if (!retro) {
  exitWithError(
    `There's no retro of ${sessionId} to log. Start one with record-watch-retro.ts.`,
  );
}

retro.result = {
  pointsRaised: Number(points),
  retroOfRetroPoints: Number(retroOfRetroPoints),
  changesMade,
  ...(fixPrNumber && { fixPr: fixPrNumber }),
};

await writeWatchList(watchList);
console.log(`Logged the retro of ${retro.sessions.join(', ')}.`);
