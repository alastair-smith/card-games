#!/usr/bin/env node
import { parseArguments } from '../../lib/script-helpers.ts';
import {
  getLabelsInUse,
  LABELLED_RETROS_BEFORE_DROPPING,
  RETROS_BEFORE_DROPPING,
  readWatchList,
  type WatchedPattern,
} from './watch-list-store.ts';

const usage = 'Usage: show-watch-list.ts [--log]';

const { log: isShowingLog = false } = parseArguments(usage, {
  options: { log: { type: 'boolean' } },
}).values;

const watchList = await readWatchList();

const isDueForDropping = (pattern: WatchedPattern) =>
  pattern.retrosWithout >= RETROS_BEFORE_DROPPING ||
  pattern.retrosWithoutInLabels >= LABELLED_RETROS_BEFORE_DROPPING;

for (const pattern of watchList.patterns) {
  const sightings = pattern.sightings
    .map(
      (sighting) =>
        `${sighting.date}${sighting.pr ? ` in #${sighting.pr}` : ''} (${sighting.session})`,
    )
    .join(', ');
  const dropNote = isDueForDropping(pattern) ? ' — propose dropping' : '';
  console.log(
    `#${pattern.id}: ${pattern.pattern}\n  labels: ${pattern.labels.join(', ')}\n  seen: ${sightings}\n  retros without it: ${pattern.retrosWithout} of ${RETROS_BEFORE_DROPPING}, ${pattern.retrosWithoutInLabels} of ${LABELLED_RETROS_BEFORE_DROPPING} touching its labels${dropNote}\n`,
  );
}

console.log(`Labels in use: ${getLabelsInUse(watchList).join(', ')}\n`);

if (isShowingLog) {
  console.log('Retro log:');
  for (const retro of watchList.retros) {
    const prs = retro.prs.length
      ? ` of ${retro.prs.map((pr) => `#${pr}`).join(', ')}`
      : '';
    const labels = retro.labels ? ` [${retro.labels.join(', ')}]` : '';
    const heading = `  ${retro.date}${prs}${labels} (${retro.sessions.join(', ')})`;
    if (!retro.result) {
      console.log(`${heading}: in progress`);
      continue;
    }
    const { pointsRaised, retroOfRetroPoints, changesMade, fixPr } =
      retro.result;
    const retroOfRetro = retroOfRetroPoints
      ? `, plus ${retroOfRetroPoints} in the retro of the retro`
      : '';
    const fix = fixPr ? ` (fixes in #${fixPr})` : '';
    console.log(
      `${heading}: ${pointsRaised} points${retroOfRetro}; ${changesMade}${fix}`,
    );
  }
}
