#!/usr/bin/env node
import { z } from 'zod';
import {
  $capture,
  fetchJson,
  parseArguments,
  REPO_FULL_NAME,
} from '../../lib/script-helpers.ts';

const milestoneListSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string().nullish(),
    open_issues: z.number(),
    closed_issues: z.number(),
  }),
);

parseArguments('Usage: list-milestones.ts', {});

const milestones = await fetchJson(
  milestoneListSchema,
  $capture`gh api ${`repos/${REPO_FULL_NAME}/milestones`}`,
);

for (const milestone of milestones) {
  const progress =
    milestone.open_issues === 0 && milestone.closed_issues > 0
      ? 'complete'
      : `${milestone.open_issues} open, ${milestone.closed_issues} closed`;
  console.log(
    `${milestone.title} (${progress}) — ${milestone.description ?? ''}`,
  );
}
