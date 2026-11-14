#!/usr/bin/env node
import path from 'node:path';
import { z } from 'zod';
import {
  exitWithError,
  exitWithUsage,
  POSITIVE_INTEGER,
  parseArguments,
} from '../../lib/script-helpers.ts';
import {
  callStorybookTool,
  getPreviewOrigin,
  getStoryUrl,
} from './storybook-mcp.ts';

const usage =
  'Usage: find-stories.ts --component <path> [--component <path> ...] [--pr <PR number>]';

const { values } = parseArguments(usage, {
  options: {
    component: { type: 'string', multiple: true },
    pr: { type: 'string' },
  },
});
const componentPaths = values.component ?? [];
const { pr } = values;

if (componentPaths.length === 0) {
  exitWithUsage(usage);
}

if (pr !== undefined && !POSITIVE_INTEGER.test(pr)) {
  exitWithError(`--pr must be a PR number such as 489, not '${pr}'.`);
}

const findSchema = z.object({
  results: z.array(
    z.object({
      componentPath: z.string(),
      pathNotFound: z.boolean().optional(),
      matches: z.array(
        z.object({
          storyId: z.string(),
          title: z.string(),
          name: z.string(),
          distance: z.number(),
        }),
      ),
    }),
  ),
});

const { results } = await callStorybookTool(
  'stories-find-by-component',
  {
    componentPaths: componentPaths.map((componentPath) =>
      path.resolve(componentPath),
    ),
  },
  findSchema,
);

for (const result of results) {
  console.log(`=== ${path.relative(process.cwd(), result.componentPath)}`);

  if (result.pathNotFound) {
    console.log('No file at this path.\n');
    continue;
  }

  if (result.matches.length === 0) {
    console.log('No stories render it.\n');
    continue;
  }

  // Distance is how many imports lie between the story and the component:
  // 1 imports it directly, higher numbers reach it through other components
  for (const match of result.matches) {
    console.log(
      `${match.distance}  ${match.title}: ${match.name}\n   ${getStoryUrl(match.storyId)}`,
    );
    if (pr) {
      console.log(
        `   ${getStoryUrl(match.storyId, undefined, getPreviewOrigin(pr))}`,
      );
    }
  }
  console.log('');
}
