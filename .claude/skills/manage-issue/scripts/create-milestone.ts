#!/usr/bin/env node
import { z } from 'zod';
import {
  $capture,
  exitWithError,
  exitWithUsage,
  fetchJson,
  parseArguments,
  REPO_FULL_NAME,
  readStdin,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: create-milestone.ts --title <title> --description < description';

const { title, description: isDescriptionPassed = false } = parseArguments(
  usage,
  {
    options: {
      title: { type: 'string' },
      description: { type: 'boolean' },
    },
  },
).values;

if (!title || !isDescriptionPassed) {
  exitWithUsage(usage);
}

const description = await readStdin('milestone description', usage);

// --slurp wraps the pages in one array, since --paginate alone prints each
// page as a separate JSON array
const existingMilestonePages = await fetchJson(
  z.array(z.array(z.object({ title: z.string() }))),
  $capture`gh api --paginate --slurp ${`repos/${REPO_FULL_NAME}/milestones?state=all&per_page=100`}`,
);

if (
  existingMilestonePages.flat().some((milestone) => milestone.title === title)
) {
  exitWithError(`A milestone called '${title}' already exists.`);
}

// -f sends each value as a plain string, so neither is read as a file or number
const milestone = await fetchJson(
  z.object({ html_url: z.string() }),
  $capture`gh api --method POST ${`repos/${REPO_FULL_NAME}/milestones`} -f ${`title=${title}`} -f ${`description=${description}`}`,
);

console.log(milestone.html_url);
