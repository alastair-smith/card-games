import { readFileSync } from 'node:fs';
import { type ParseArgsConfig, parseArgs } from 'node:util';
import { $, type ProcessOutput } from 'zx';

declare const brand: unique symbol;

/**
 * A `BaseType` that has passed a check, so it can't be mixed up with an
 * unchecked value. Mirrors `Branded` in `apps/web/src/types/brand.ts`.
 */
export type Branded<BaseType, BrandLabel> = BaseType & {
  [brand]: BrandLabel;
};

/**
 * A GitHub issue number, digits only. Kept as a string so `0123` reaches
 * `gh` as typed rather than as `123`.
 */
export type IssueNumber = Branded<string, 'IssueNumber'>;

/** The checked-out branch, known not to be `main` or a detached HEAD. */
export type IssueBranch = Branded<string, 'IssueBranch'>;

/** The repo every script targets, so `gh` never acts on another one. */
export const REPO = 'github.com/alastair-smith/card-games';

/** Prints the usage line to stderr and exits with status 1. */
export function exitWithUsage(usage: string): never {
  console.error(usage);
  process.exit(1);
}

/**
 * Parses `process.argv` with Node's `parseArgs`, exiting with the usage line
 * on anything the config doesn't declare. That strictness is what makes the
 * scripts safe to allowlist: an extra flag such as `--repo` never reaches `gh`.
 */
export function parseArguments<const Config extends ParseArgsConfig>(
  usage: string,
  config: Config,
) {
  try {
    return parseArgs(config);
  } catch {
    exitWithUsage(usage);
  }
}

/** Whether `value` is an issue number: present and digits only. */
export function isIssueNumber(value: string | undefined): value is IssueNumber {
  return value !== undefined && /^[0-9]+$/.test(value);
}

/**
 * Reads all of stdin, exiting with the usage line if nothing is piped in and
 * with an error naming `description` if what's piped in is empty.
 */
export function readRequiredStdin(description: string, usage: string): string {
  if (process.stdin.isTTY) {
    exitWithUsage(usage);
  }

  const text = readFileSync(0, 'utf8').trimEnd();

  if (!text) {
    console.error(`The ${description} (read from stdin) is empty.`);
    process.exit(1);
  }

  return text;
}

/** Reads all of stdin, or returns an empty string if nothing is piped in. */
export function readOptionalStdin(): string {
  return process.stdin.isTTY ? '' : readFileSync(0, 'utf8').trimEnd();
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
  const branch = (await $`git branch --show-current`).stdout.trim();

  if (!branch || branch === 'main') {
    console.error(
      `Only issue branches can ${action}, not '${branch || 'detached HEAD'}'.`,
    );
    process.exit(1);
  }

  return branch as IssueBranch;
}

/**
 * zx's `$`, set up to print the command's output as it runs and not throw
 * when it fails. Pass the result to `exitWithResult`.
 */
export const $passthrough = $({
  stdio: ['pipe', 'inherit', 'inherit'],
  nothrow: true,
});

/** Exits with the command's exit code, or 1 if it was killed by a signal. */
export function exitWithResult(result: ProcessOutput): void {
  process.exitCode = result.exitCode ?? 1;
}
