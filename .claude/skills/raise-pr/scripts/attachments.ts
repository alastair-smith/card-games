import { stat } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { exitWithError } from '../../lib/script-helpers.ts';

/**
 * Checks each file is a screenshot `take-screenshots.ts` saved for this
 * branch, then returns the `--attach` arguments for `gh pr create` or
 * `gh pr edit`. Limiting attachments to that folder means the script can't
 * upload any other local file to GitHub.
 */
export async function getAttachArguments(
  files: string[],
  branch: string,
): Promise<string[]> {
  const directory = resolve('.pr-screenshots', branch);

  for (const file of files) {
    const path = relative(directory, resolve(file));
    // gh reads anything after # as alt text, which belongs in the body instead
    if (
      path.startsWith('..') ||
      path.includes(sep) ||
      !path.endsWith('.png') ||
      file.includes('#')
    ) {
      exitWithError(
        `--attach takes a screenshot from .pr-screenshots/${branch}/, not '${file}'.`,
      );
    }

    const fileStats = await stat(file).catch(() => null);
    if (!fileStats?.isFile()) {
      exitWithError(`There's no screenshot at '${file}'.`);
    }
  }

  // The --flag=value form stops a value that starts with a dash from being read as another flag
  return files.map((file) => `--attach=${file}`);
}
