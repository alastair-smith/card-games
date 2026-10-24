#!/usr/bin/env node
import { z } from 'zod';
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
  readStdin,
} from '../../lib/script-helpers.ts';
import {
  callStorybookTool,
  getStandaloneUrl,
  STORY_ID,
} from './storybook-mcp.ts';

const usage = 'Usage: story-url.ts --story <story id> [--props]';

const { story, props: hasProps = false } = parseArguments(usage, {
  options: {
    story: { type: 'string' },
    props: { type: 'boolean' },
  },
}).values;

if (!story) {
  exitWithUsage(usage);
}

if (!STORY_ID.test(story)) {
  exitWithError(
    `--story must be a Storybook story ID such as 'ui-components-dialog--dialog-example', not '${story}'.`,
  );
}

const propsSchema = z.record(z.string(), z.unknown());

async function readProps(): Promise<Record<string, unknown> | undefined> {
  if (!hasProps) {
    return undefined;
  }

  let json: unknown;
  try {
    json = JSON.parse(await readStdin('props', usage));
  } catch {
    exitWithError(
      '--props reads a JSON object from stdin, and that was not JSON.',
    );
  }

  const parsed = propsSchema.safeParse(json);
  if (!parsed.success) {
    exitWithError(
      '--props reads a JSON object from stdin, e.g. {"name": "Roz"}.',
    );
  }
  return parsed.data;
}

const previewSchema = z.object({
  stories: z.array(
    z.union([
      z.object({ title: z.string(), name: z.string(), previewUrl: z.string() }),
      z.object({ error: z.string() }),
    ]),
  ),
});

const props = await readProps();
const { stories } = await callStorybookTool(
  'stories-preview',
  { stories: [{ storyId: story, ...(props ? { props } : {}) }] },
  previewSchema,
);

const [preview] = stories;
if (!preview) {
  exitWithError(`stories-preview returned nothing for '${story}'.`);
}
if ('error' in preview) {
  exitWithError(preview.error);
}

// Kept as Storybook encoded it, since reading it through URLSearchParams
// would turn its + for a space into a literal +
const args = /[?&]args=([^&]*)/.exec(preview.previewUrl)?.[1];

console.log(`${preview.title}: ${preview.name}`);
console.log(getStandaloneUrl(story, args));
