import { z } from 'zod';
import {
  $capture,
  fetchJson,
  type IssueNumber,
  REPO_FULL_NAME,
  REPO_OWNER,
} from '../../lib/script-helpers.ts';

const PROJECT_NUMBER = 3;
const PROJECT_ITEM_LIMIT = 500;

/** The project's node ID, which `gh project item-edit` takes. */
export const PROJECT_ID = 'PVT_kwHOAWNxLc4A7LCG';

/** The node ID of the project's Status field. */
export const STATUS_FIELD_ID = 'PVTSSF_lAHOAWNxLc4A7LCGzgvjLoQ';

/** The board's columns, in order. */
export const statusSchema = z.enum([
  'Triage',
  'Backlog',
  'Ready',
  'In progress',
  'In review',
  'Done',
]);

export type Status = z.infer<typeof statusSchema>;

/** Each board column's option ID in the Status field. */
export const STATUS_OPTION_IDS = {
  Triage: 'd29ed546',
  Backlog: 'f75ad846',
  Ready: '61e4505c',
  'In progress': '47fc9ee4',
  'In review': 'df73e18b',
  Done: '98236657',
} as const satisfies Record<Status, string>;

/** Whether `value` is one of the board's columns. */
export function isStatus(value: string | undefined): value is Status {
  return statusSchema.safeParse(value).success;
}

export const projectItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string().nullish(),
  milestone: z.object({ title: z.string() }).nullish(),
  // Draft items have no issue number or repository
  content: z.object({
    type: z.string(),
    number: z.number().nullish(),
    repository: z.string().nullish(),
  }),
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

/**
 * Whether the item is this repo's issue with the given number. The board
 * belongs to the user rather than the repo, so it can hold another repo's
 * issue with the same number.
 */
export function isRepoIssue(
  item: ProjectItem,
  issueNumber: IssueNumber,
): boolean {
  return (
    item.content.type === 'Issue' &&
    item.content.repository === REPO_FULL_NAME &&
    item.content.number === Number(issueNumber)
  );
}
