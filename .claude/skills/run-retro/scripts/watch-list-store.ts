import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  $capture,
  exitIfFailed,
  exitWithError,
  POSITIVE_INTEGER,
} from '../../lib/script-helpers.ts';

export const WATCH_LIST_PATH = fileURLToPath(
  new URL('../watch-list.json', import.meta.url),
);

/** Retros without a pattern after which a retro proposes dropping it */
export const RETROS_BEFORE_DROPPING = 5;

export const sessionIdSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  .brand<'SessionId'>();

export type SessionId = z.infer<typeof sessionIdSchema>;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const prNumberSchema = z.number().int().positive();

// Session transcripts are local and short-lived, so a PR keeps the evidence.
// Left out where the PR isn't known
const sightingSchema = z.object({
  date: dateSchema,
  session: sessionIdSchema,
  pr: prNumberSchema.optional(),
});

const patternSchema = z.object({
  id: z.number().int().positive(),
  pattern: z.string().min(1),
  sightings: z.array(sightingSchema).min(1),
  retrosWithout: z.number().int().nonnegative(),
});

export type WatchedPattern = z.infer<typeof patternSchema>;

// Filled in at the end of the retro. A retro that changes nothing has no PR
const retroResultSchema = z.object({
  pointsRaised: z.number().int().nonnegative(),
  retroOfRetroPoints: z.number().int().nonnegative(),
  changesMade: z.string().min(1),
  fixPr: prNumberSchema.optional(),
});

const retroSchema = z.object({
  date: dateSchema,
  sessions: z.array(sessionIdSchema).min(1),
  prs: z.array(prNumberSchema),
  result: retroResultSchema.optional(),
});

export type Retro = z.infer<typeof retroSchema>;

const watchListSchema = z.object({
  patterns: z.array(patternSchema),
  retros: z.array(retroSchema),
});

export type WatchList = z.infer<typeof watchListSchema>;

// The local date, as a retro just after midnight belongs to that day.
// en-CA writes dates as YYYY-MM-DD
export const today = () => new Date().toLocaleDateString('en-CA');

export function parseSessionId(value: string | undefined): SessionId {
  const parsed = sessionIdSchema.safeParse(value);
  if (!parsed.success) {
    exitWithError(
      `--session must be a session ID such as 'ccb4c7f3-a1e1-4575-b60f-6422de8669fe', not '${value}'.`,
    );
  }
  return parsed.data;
}

export function parsePrNumber(value: string, option: string): number {
  const parsed = prNumberSchema.safeParse(
    POSITIVE_INTEGER.test(value) ? Number(value) : Number.NaN,
  );
  if (!parsed.success) {
    exitWithError(`${option} must be a PR number such as 400, not '${value}'.`);
  }
  return parsed.data;
}

export function findRetro(
  watchList: WatchList,
  sessionId: SessionId,
): Retro | undefined {
  return watchList.retros.find((retro) => retro.sessions.includes(sessionId));
}

export function parsePatternId(
  watchList: WatchList,
  value: string | undefined,
): WatchedPattern {
  const pattern = watchList.patterns.find(
    (watchedPattern) => String(watchedPattern.id) === value,
  );
  if (!pattern) {
    exitWithError(
      `'${value}' isn't a pattern ID on the watch list. List them with show-watch-list.ts.`,
    );
  }
  return pattern;
}

export async function readWatchList(): Promise<WatchList> {
  const parsed = watchListSchema.safeParse(
    JSON.parse(await readFile(WATCH_LIST_PATH, 'utf8')),
  );
  if (!parsed.success) {
    exitWithError(
      `watch-list.json isn't in the expected shape:\n${z.prettifyError(parsed.error)}`,
    );
  }
  return parsed.data;
}

// Fixed with the same checks as the Lint job afterwards, so the file passes it
export async function writeWatchList(watchList: WatchList): Promise<void> {
  await writeFile(WATCH_LIST_PATH, `${JSON.stringify(watchList, null, 2)}\n`);
  exitIfFailed(await $capture`pnpm format:fix ${WATCH_LIST_PATH}`);
}
