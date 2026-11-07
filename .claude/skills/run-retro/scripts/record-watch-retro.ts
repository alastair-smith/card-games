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
  'Usage: record-watch-retro.ts --session <session id> [--session …] [--pr <number> …] [--seen <pattern id>[:<pr number>] …]';

const {
  session: sessions = [],
  pr: prs = [],
  seen: seenValues = [],
} = parseArguments(usage, {
  options: {
    session: { type: 'string', multiple: true },
    pr: { type: 'string', multiple: true },
    seen: { type: 'string', multiple: true },
  },
}).values;

if (sessions.length === 0) {
  exitWithUsage(usage);
}

const sessionIds = sessions.map((session) => parseSessionId(session));
const prNumbers = prs.map((pr) => parsePrNumber(pr, '--pr'));
const watchList = await readWatchList();

for (const sessionId of sessionIds) {
  if (findRetro(watchList, sessionId)) {
    exitWithError(`The retro of ${sessionId} is already recorded.`);
  }
}

const sightings = seenValues.map((value) => {
  const [patternId, pr] = value.split(':');
  return {
    pattern: parsePatternId(watchList, patternId),
    pr: pr === undefined ? undefined : parsePrNumber(pr, '--seen'),
  };
});
const seenPatterns = new Set<WatchedPattern>(
  sightings.map((sighting) => sighting.pattern),
);
const [firstSessionId] = sessionIds;
const isAddedThisRetro = (pattern: WatchedPattern) =>
  pattern.sightings.some((sighting) => sessionIds.includes(sighting.session));

for (const sighting of sightings) {
  if (!isAddedThisRetro(sighting.pattern) && firstSessionId) {
    sighting.pattern.sightings.push({
      date: today(),
      session: firstSessionId,
      ...(sighting.pr && { pr: sighting.pr }),
    });
  }
  sighting.pattern.retrosWithout = 0;
}

const bumpedPatterns = watchList.patterns.filter(
  (pattern) => !seenPatterns.has(pattern) && !isAddedThisRetro(pattern),
);
for (const pattern of bumpedPatterns) {
  pattern.retrosWithout += 1;
}

watchList.retros.push({ date: today(), sessions: sessionIds, prs: prNumbers });

await writeWatchList(watchList);

for (const pattern of seenPatterns) {
  console.log(
    `#${pattern.id} seen again, ${pattern.sightings.length} sightings: a candidate for a change.`,
  );
}
console.log(
  `Added a retro without it to ${bumpedPatterns.length} patterns, and started the retro's log entry. Finish it with log-retro.ts.`,
);
