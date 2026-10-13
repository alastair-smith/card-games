import { z } from 'zod';
import { $capture, fetchJson, REPO_OWNER } from '../../lib/script-helpers.ts';

const PROJECT_NUMBER = 3;
const PROJECT_ITEM_LIMIT = 500;

/** The project's node ID, which `gh project item-edit` takes. */
export const PROJECT_ID = 'PVT_kwHOAWNxLc4A7LCG';

/** The node ID of the project's Status field. */
export const STATUS_FIELD_ID = 'PVTSSF_lAHOAWNxLc4A7LCGzgvjLoQ';

/** Each board column's option ID in the Status field. */
export const STATUS_OPTION_IDS = {
  Triage: 'd29ed546',
  Backlog: 'f75ad846',
  Ready: '61e4505c',
  'In progress': '47fc9ee4',
  'In review': 'df73e18b',
  Done: '98236657',
} as const satisfies Record<string, string>;

export type Status = keyof typeof STATUS_OPTION_IDS;

/** Whether `value` is one of the board's columns. */
export function isStatus(value: string | undefined): value is Status {
  return value !== undefined && Object.hasOwn(STATUS_OPTION_IDS, value);
}

export const projectItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string().optional(),
  milestone: z.object({ title: z.string() }).optional(),
  // Draft items have no issue number
  content: z.object({ number: z.number().optional() }),
});

export type ProjectItem = z.infer<typeof projectItemSchema>;

const projectItemListSchema = z.object({
  items: z.array(projectItemSchema),
});

/** Every item on the board, exiting with `gh`'s exit code if it fails. */
export async function fetchProjectItems(): Promise<ProjectItem[]> {
  const { items } = await fetchJson(
    projectItemListSchema,
    $capture`gh project item-list ${PROJECT_NUMBER} --owner ${REPO_OWNER} --limit ${PROJECT_ITEM_LIMIT} --format json`,
  );

  return items;
}
