#!/usr/bin/env node
import { parseArguments } from '../../lib/script-helpers.ts';
import { RETROS_BEFORE_DROPPING, readWatchList } from './watch-list-store.ts';

const usage = 'Usage: show-watch-list.ts [--log]';

const { log: isShowingLog = false } = parseArguments(usage, {
  options: { log: { type: 'boolean' } },
}).values;

const watchList = await readWatchList();

for (const pattern of watchList.patterns) {
  const sightings = pattern.sightings
    .map(
      (sighting) =>
        `${sighting.date}${sighting.pr ? ` in #${sighting.pr}` : ''} (${sighting.session})`,
    )
    .join(', ');
  const dropNote =
    pattern.retrosWithout >= RETROS_BEFORE_DROPPING
      ? ' — propose dropping'
      : '';
  console.log(
    `#${pattern.id}: ${pattern.pattern}\n  seen: ${sightings}\n  retros without it: ${pattern.retrosWithout}${dropNote}\n`,
  );
}

if (isShowingLog) {
  console.log('Retro log:');
  for (const retro of watchList.retros) {
    const prs = retro.prs.length
      ? ` of ${retro.prs.map((pr) => `#${pr}`).join(', ')}`
      : '';
    const heading = `  ${retro.date}${prs} (${retro.sessions.join(', ')})`;
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
