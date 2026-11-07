#!/usr/bin/env node
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';
import {
  findRetro,
  parsePatternId,
  parsePrNumber,
  parseSessionId,
  readWatchList,
  today,
  type WatchedPattern,
  writeWatchList,
} from './watch-list-store.ts';

const usage =
  'Usage: record-watch-retro.ts --session <session id> [--session …] [--pr <number> …] [--seen <pattern id>[:<pr number>][@<session id>] …] [--retro-of-retro]';

const SEEN = /^([^:@]+)(?::([^:@]+))?(?:@([^:@]+))?$/;

const {
  session: sessions = [],
  pr: prs = [],
  seen: seenValues = [],
  'retro-of-retro': isRetroOfRetro = false,
} = parseArguments(usage, {
  options: {
    session: { type: 'string', multiple: true },
    pr: { type: 'string', multiple: true },
    seen: { type: 'string', multiple: true },
    'retro-of-retro': { type: 'boolean' },
  },
}).values;

const sessionIds = sessions.map((session) => parseSessionId(session));
const [firstSessionId] = sessionIds;
if (!firstSessionId) {
  exitWithUsage(usage);
}

const prNumbers = prs.map((pr) => parsePrNumber(pr, '--pr'));
const watchList = await readWatchList();

const retro = findRetro(watchList, firstSessionId);
if (isRetroOfRetro && !retro) {
  exitWithError(
    'There is no retro of these sessions to add to. Record it without --retro-of-retro first.',
  );
}
if (!isRetroOfRetro) {
  for (const sessionId of sessionIds) {
    if (findRetro(watchList, sessionId)) {
      exitWithError(
        `The retro of ${sessionId} is already recorded. For the retro of the retro, pass --retro-of-retro.`,
      );
    }
  }
}
if (isRetroOfRetro && prNumbers.length) {
  exitWithError(
    "--pr only applies to the retro's first record, not --retro-of-retro.",
  );
}

const sightings = seenValues.map((value) => {
  const match = SEEN.exec(value);
  if (!match) {
    exitWithError(
      `--seen must be <pattern id>[:<pr number>][@<session id>], such as 12:400, not '${value}'.`,
    );
  }
  const [, patternId, pr, session] = match;
  if (session === undefined && sessionIds.length > 1) {
    exitWithError(
      `--seen ${value} needs @<session id>, as this retro covers ${sessionIds.length} sessions.`,
    );
  }
  const sessionId =
    session === undefined ? firstSessionId : parseSessionId(session);
  if (!sessionIds.includes(sessionId)) {
    exitWithError(`--seen ${value} names a session this retro doesn't cover.`);
  }
  return {
    pattern: parsePatternId(watchList, patternId),
    pr: pr === undefined ? undefined : parsePrNumber(pr, '--seen'),
    sessionId,
  };
});

const seenPatterns = new Set<WatchedPattern>();
for (const sighting of sightings) {
  if (seenPatterns.has(sighting.pattern)) {
    exitWithError(
      `Pattern #${sighting.pattern.id} is passed to --seen more than once. Pass it once, with the PR it came back in.`,
    );
  }
  seenPatterns.add(sighting.pattern);
}

const isAddedThisRetro = (pattern: WatchedPattern) =>
  pattern.sightings.some((sighting) => sessionIds.includes(sighting.session));

for (const sighting of sightings) {
  if (isAddedThisRetro(sighting.pattern)) {
    exitWithError(
      `Pattern #${sighting.pattern.id} was added or seen in this retro already.`,
    );
  }
  sighting.pattern.sightings.push({
    date: today(),
    session: sighting.sessionId,
    ...(sighting.pr && { pr: sighting.pr }),
  });
  sighting.pattern.retrosWithout = 0;
}

// The first record already counted this retro for every other pattern
const bumpedPatterns = isRetroOfRetro
  ? []
  : watchList.patterns.filter(
      (pattern) => !seenPatterns.has(pattern) && !isAddedThisRetro(pattern),
    );
for (const pattern of bumpedPatterns) {
  pattern.retrosWithout += 1;
}

if (!isRetroOfRetro) {
  watchList.retros.push({
    date: today(),
    sessions: sessionIds,
    prs: prNumbers,
  });
}

await writeWatchList(watchList);

for (const pattern of seenPatterns) {
  console.log(
    `#${pattern.id} seen again, ${pattern.sightings.length} sightings: a candidate for a change.`,
  );
}
console.log(
  isRetroOfRetro
    ? "Recorded the retro of the retro's sightings."
    : `Added a retro without it to ${bumpedPatterns.length} patterns, and started the retro's log entry. Finish it with log-retro.ts.`,
);
