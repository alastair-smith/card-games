#!/usr/bin/env node
import { z } from 'zod';
import {
  $capture,
  exitWithUsage,
  fetchJson,
  isIssueNumber,
  parseArguments,
  REPO_FULL_NAME,
} from '../../lib/script-helpers.ts';

const usage = 'Usage: list-review-comments.ts <PR number>';

const { positionals } = parseArguments(usage, {
  options: {},
  allowPositionals: true,
});

const [pullRequestNumber, ...extraArguments] = positionals;
if (!isIssueNumber(pullRequestNumber) || extraArguments.length > 0) {
  exitWithUsage(usage);
}

const reviewCommentSchema = z.object({
  id: z.number(),
  path: z.string(),
  line: z.number().nullable(),
  original_line: z.number().nullable(),
  body: z.string(),
  in_reply_to_id: z.number().optional(),
  user: z.object({ login: z.string() }).nullable(),
});

type ReviewComment = z.infer<typeof reviewCommentSchema>;

// Inline comments only; gh pr view shows reviews and conversation comments
const comments = await fetchJson(
  z.array(reviewCommentSchema),
  $capture`gh api ${`repos/${REPO_FULL_NAME}/pulls/${pullRequestNumber}/comments?per_page=100`}`,
);

if (comments.length === 0) {
  console.log(`PR #${pullRequestNumber} has no inline review comments.`);
  process.exit(0);
}

const repliesByThread = new Map<number, ReviewComment[]>();
for (const comment of comments) {
  if (comment.in_reply_to_id === undefined) continue;
  const replies = repliesByThread.get(comment.in_reply_to_id) ?? [];
  replies.push(comment);
  repliesByThread.set(comment.in_reply_to_id, replies);
}

const describeLine = (comment: ReviewComment) =>
  comment.line === null
    ? `line ${comment.original_line ?? '?'}, outdated`
    : `line ${comment.line}`;

const author = (comment: ReviewComment) => comment.user?.login ?? 'unknown';

const threads = comments
  .filter((comment) => comment.in_reply_to_id === undefined)
  .sort(
    (first, second) =>
      first.path.localeCompare(second.path) ||
      (first.line ?? first.original_line ?? 0) -
        (second.line ?? second.original_line ?? 0),
  );

for (const thread of threads) {
  console.log(`${thread.path} (${describeLine(thread)}), ${author(thread)}:`);
  console.log(`  ${thread.body.replaceAll('\n', '\n  ')}`);
  for (const reply of repliesByThread.get(thread.id) ?? []) {
    console.log(
      `    ↳ ${author(reply)}: ${reply.body.replaceAll('\n', '\n      ')}`,
    );
  }
  console.log();
}
