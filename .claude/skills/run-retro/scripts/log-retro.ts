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
  'Usage: log-retro.ts --session <session id> --points <count> [--fix-pr <number>] [--retro-of-retro] --changes  (changes made read from stdin)';

const COUNT = /^(0|[1-9][0-9]*)$/;

const {
  session,
  points,
  'fix-pr': fixPr,
  'retro-of-retro': isRetroOfRetro = false,
  changes: isChangesPiped = false,
} = parseArguments(usage, {
  options: {
    session: { type: 'string' },
    points: { type: 'string' },
    'fix-pr': { type: 'string' },
    'retro-of-retro': { type: 'boolean' },
    changes: { type: 'boolean' },
  },
}).values;

if (!points || !isChangesPiped) {
  exitWithUsage(usage);
}

if (!COUNT.test(points)) {
  exitWithError(`--points must be a count such as 3, not '${points}'.`);
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

if (isRetroOfRetro) {
  if (!retro.result) {
    exitWithError(
      "Log the retro's own result first, then the retro of the retro.",
    );
  }
  const existingFixPr = retro.result.fixPr ?? fixPrNumber;
  retro.result = {
    ...retro.result,
    retroOfRetroPoints: Number(points),
    changesMade: `${retro.result.changesMade}; from the retro of the retro, ${changesMade}`,
    ...(existingFixPr && { fixPr: existingFixPr }),
  };
} else {
  if (retro.result) {
    exitWithError(
      `The retro of ${sessionId} is already logged. For the retro of the retro, pass --retro-of-retro.`,
    );
  }
  retro.result = {
    pointsRaised: Number(points),
    retroOfRetroPoints: 0,
    changesMade,
    ...(fixPrNumber && { fixPr: fixPrNumber }),
  };
}

await writeWatchList(watchList);
console.log(`Logged the retro of ${retro.sessions.join(', ')}.`);
