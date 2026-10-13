import { fstatSync } from 'node:fs';
import { type ParseArgsConfig, parseArgs } from 'node:util';
import { z } from 'zod';
import { $, type ProcessOutput } from 'zx';

/**
 * A GitHub issue number, digits only. Kept as a string so `0123` reaches
 * `gh` as typed rather than as `123`.
 */
export const issueNumberSchema = z
  .string()
  .regex(/^[0-9]+$/)
  .brand<'IssueNumber'>();

export type IssueNumber = z.infer<typeof issueNumberSchema>;

export const REPO_OWNER = 'alastair-smith';
export const REPO_NAME = 'card-games';

/** The repo as `owner/name`, as GitHub's API and project items name it. */
export const REPO_FULL_NAME = `${REPO_OWNER}/${REPO_NAME}`;

/** The repo every script targets, so `gh` never acts on another one. */
export const REPO = `github.com/${REPO_FULL_NAME}`;

/** Prints the message to stderr and exits with status 1. */
export function exitWithError(message: string): never {
  console.error(message);
  process.exit(1);
}

/** Prints the usage line to stderr and exits with status 1. */
export function exitWithUsage(usage: string): never {
  exitWithError(usage);
}

/**
 * Parses `process.argv` with Node's `parseArgs`, exiting with its error and
 * the usage line on anything the config doesn't declare. That strictness is
 * what makes the scripts safe to allowlist: an extra flag such as `--repo`
 * never reaches `gh`.
 */
export function parseArguments<const Config extends ParseArgsConfig>(
  usage: string,
  config: Config,
) {
  try {
    return parseArgs(config);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    exitWithUsage(usage);
  }
}

/** Whether `value` is an issue number: present and digits only. */
export function isIssueNumber(value: string | undefined): value is IssueNumber {
  return issueNumberSchema.safeParse(value).success;
}

/**
 * Whether something such as a heredoc is piped into stdin, found from what
 * stdin is rather than by reading it, so it can't wait. `/dev/null` and a
 * terminal don't count.
 */
export function isStdinPiped(): boolean {
  const stdin = fstatSync(0);
  return stdin.isFIFO() || stdin.isFile();
}

/**
 * Reads all of stdin, exiting with the usage line if nothing is piped in and
 * with an error naming `description` if it's empty. Strips trailing newlines
 * only, as `$(cat)` does in bash, so a Markdown line break at the end (two
 * trailing spaces) survives.
 */
export async function readStdin(
  description: string,
  usage: string,
): Promise<string> {
  if (!isStdinPiped()) {
    exitWithUsage(usage);
  }

  // Streaming rather than readFileSync(0), which throws EAGAIN when stdin is
  // a non-blocking pipe
  process.stdin.setEncoding('utf8');
  let text = '';
  for await (const chunk of process.stdin) {
    text += chunk;
  }
  text = text.replace(/\n+$/, '');

  if (!text) {
    exitWithError(`The ${description} (read from stdin) is empty.`);
  }

  return text;
}

/**
 * Reads the body from stdin if `--body` was passed, or returns an empty
 * string if it wasn't. Exits if a body is piped in without `--body`, rather
 * than silently dropping it.
 */
export async function readBodyIfPassed(
  isBodyPassed: boolean,
  description: string,
  usage: string,
): Promise<string> {
  if (isBodyPassed) {
    return readStdin(description, usage);
  }

  if (isStdinPiped()) {
    exitWithError(
      `A body is piped in. Pass --body to replace the ${description}.`,
    );
  }

  return '';
}

/**
 * zx's `$`, set up to print the command's output as it runs and not throw
 * when it fails. Pass the result to `exitWithResult`.
 *
 * @param input sent to the command's stdin, e.g. for `--body-file -`. Without
 * it the command gets no stdin, so it can never wait on one.
 */
export function $passthrough(input = '') {
  return $({
    input: input || undefined,
    stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'],
    nothrow: true,
  });
}

/**
 * zx's `$`, set up to capture the command's output and not throw when it
 * fails. Its stderr still prints, and it gets no stdin. Pass the result to
 * `exitIfFailed` before using its output.
 */
export const $capture = $({
  stdio: ['ignore', 'pipe', 'pipe'],
  nothrow: true,
});

/** Exits with the command's exit code, or 1 if it was killed by a signal. */
export function exitWithResult(result: ProcessOutput): never {
  process.exit(result.exitCode ?? 1);
}

/** Exits with the command's exit code if it didn't succeed. */
export function exitIfFailed(result: ProcessOutput): void {
  if (result.exitCode !== 0) {
    exitWithResult(result);
  }
}

/**
 * Runs a command that prints JSON, such as `gh … --format json`, and returns
 * its output checked against `schema`. Exits with the command's exit code if
 * it fails, or with 1 and a short error if its output isn't what `schema`
 * expects.
 */
export async function fetchJson<Schema extends z.ZodType>(
  schema: Schema,
  command: Promise<ProcessOutput>,
): Promise<z.infer<Schema>> {
  const result = await command;
  exitIfFailed(result);

  let json: unknown;
  try {
    // Not result.json(), which parses stdout and stderr together, so a
    // warning from gh on stderr would break it
    json = JSON.parse(result.stdout);
  } catch {
    exitWithError('The command printed something other than JSON.');
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    exitWithError(
      `The command's JSON wasn't in the expected shape:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}

/**
 * Returns the checked-out branch, exiting with an error if it's `main` or a
 * detached HEAD.
 *
 * @param action what only issue branches can do, finishing the sentence
 * "Only issue branches can …"
 */
export async function getIssueBranch(
  action: 'have a PR' | 'be pushed',
): Promise<string> {
  const result = await $capture`git branch --show-current`;
  exitIfFailed(result);
  const branch = result.stdout.trim();

  if (!branch || branch === 'main') {
    exitWithError(
      `Only issue branches can ${action}, not '${branch || 'detached HEAD'}'.`,
    );
  }

  return branch;
}
