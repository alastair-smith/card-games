import type { Branded } from '../../lib/script-helpers.ts';

/** A PR title that passes the PR Title check in `.github/workflows/ci.yml`. */
export type PrTitle = Branded<string, 'PrTitle'>;

/**
 * Exits with an error unless the title starts with 🚀, 🔧, 📚 or 🐛, a space
 * and a capital letter, matching the CI check.
 */
export function assertPrTitle(title: string): asserts title is PrTitle {
  if (!/^(🚀|🔧|📚|🐛) [A-Z]/u.test(title)) {
    console.error(
      'The title must start with 🚀, 🔧, 📚 or 🐛, a space and a capital letter.',
    );
    process.exit(1);
  }
}
