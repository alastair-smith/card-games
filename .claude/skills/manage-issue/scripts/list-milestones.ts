#!/usr/bin/env node
import { z } from 'zod';
import {
  $capture,
  fetchJson,
  parseArguments,
  REPO_FULL_NAME,
} from '../../lib/script-helpers.ts';

const milestoneListSchema = z.array(
  z.object({ title: z.string(), description: z.string().nullish() }),
);

parseArguments('Usage: list-milestones.ts', {});

const milestones = await fetchJson(
  milestoneListSchema,
  $capture`gh api ${`repos/${REPO_FULL_NAME}/milestones`}`,
);

for (const milestone of milestones) {
  console.log(`${milestone.title} — ${milestone.description ?? ''}`);
}
