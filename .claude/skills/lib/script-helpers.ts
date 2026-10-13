import { type ParseArgsConfig, parseArgs } from 'node:util';
import type { z } from 'zod';
import { $, type ProcessOutput } from 'zx';
import type { Branded } from '../../../apps/web/src/types/brand.ts';

export type { Branded };

/**
 * A GitHub issue number, digits only. Kept as a string so `0123` reaches
 * `gh` as typed rather than as `123`.
 */
export type IssueNumber = Branded<string, 'IssueNumber'>;

/** The checked-out branch, known not to be `main` or a detached HEAD. */
export type IssueBranch = Branded<string, 'IssueBranch'>;

export const REPO_OWNER = 'alastair-smith';
export const REPO_NAME = 'card-games';

/** The repo every script targets, so `gh` never acts on another one. */
export const REPO = `github.com/${REPO_OWNER}/${REPO_NAME}`;

/** Prints the usage line to stderr and exits with status 1. */
export function exitWithUsage(usage: string): never {
  console.error(usage);
  process.exit(1);
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
  return value !== undefined && /^[0-9]+$/.test(value);
}

/**
 * Reads all of stdin, or returns an empty string if nothing is piped in.
 * Strips trailing newlines only, as `$(cat)` does in bash, so a Markdown
 * line break at the end (two trailing spaces) survives.
 */
export async function readOptionalStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return '';
  }

  // Streaming rather than readFileSync(0), which throws EAGAIN when stdin is
  // a non-blocking pipe
  process.stdin.setEncoding('utf8');
  let text = '';
  for await (const chunk of process.stdin) {
    text += chunk;
  }

  return text.replace(/\n+$/, '');
}

/**
 * Reads all of stdin, exiting with the usage line if nothing is piped in and
 * with an error naming `description` if what's piped in is empty.
 */
export async function readRequiredStdin(
  description: string,
  usage: string,
): Promise<string> {
  if (process.stdin.isTTY) {
    exitWithUsage(usage);
  }

  const text = await readOptionalStdin();

  if (!text) {
    console.error(`The ${description} (read from stdin) is empty.`);
    process.exit(1);
  }

  return text;
}

/**
 * zx's `$`, set up to print the command's output as it runs and not throw
 * when it fails. Pass the result to `exitWithResult`.
 */
export const $passthrough = $({
  stdio: ['pipe', 'inherit', 'inherit'],
  nothrow: true,
});

/**
 * zx's `$`, set up to capture the command's output and not throw when it
 * fails. Its stderr still prints. Pass the result to `exitIfFailed` before
 * using its output.
 */
export const $capture = $({ nothrow: true });

/** Exits with the command's exit code, or 1 if it was killed by a signal. */
export function exitWithResult(result: ProcessOutput): void {
  process.exitCode = result.exitCode ?? 1;
}

/** Exits with the command's exit code if it didn't succeed. */
export function exitIfFailed(result: ProcessOutput): void {
  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}

/**
 * Runs a command that prints JSON, such as `gh … --format json`, and returns
 * its output checked against `schema`. Exits with the command's exit code if
 * it fails.
 */
export async function fetchJson<Schema extends z.ZodType>(
  schema: Schema,
  command: Promise<ProcessOutput>,
): Promise<z.infer<Schema>> {
  const result = await command;
  exitIfFailed(result);
  return schema.parse(result.json());
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
): Promise<IssueBranch> {
  const result = await $capture`git branch --show-current`;
  exitIfFailed(result);
  const branch = result.stdout.trim();

  if (!branch || branch === 'main') {
    console.error(
      `Only issue branches can ${action}, not '${branch || 'detached HEAD'}'.`,
    );
    process.exit(1);
  }

  return branch as IssueBranch;
}
