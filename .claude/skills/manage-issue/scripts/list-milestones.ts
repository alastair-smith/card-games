#!/usr/bin/env node
import {
  $passthrough,
  exitWithResult,
  parseArguments,
} from '../../lib/script-helpers.ts';

parseArguments('Usage: list-milestones.ts', {});

exitWithResult(
  await $passthrough`gh api repos/alastair-smith/card-games/milestones --jq ${'.[] | "\\(.title) — \\(.description)"'}`,
);
