#!/usr/bin/env node
import path from 'node:path';
import { z } from 'zod';
import { exitWithUsage, parseArguments } from '../../lib/script-helpers.ts';
import { callStorybookTool, getStoryUrl } from './storybook-mcp.ts';

const usage =
  'Usage: find-stories.ts --component <path> [--component <path> ...]';

const { values } = parseArguments(usage, {
  options: { component: { type: 'string', multiple: true } },
});
const componentPaths = values.component ?? [];

if (componentPaths.length === 0) {
  exitWithUsage(usage);
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
  }
  console.log('');
}
