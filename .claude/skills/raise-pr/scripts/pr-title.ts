import { exitWithError } from '../../lib/script-helpers.ts';

/**
 * Exits with an error unless the title starts with 🚀, 🔧, 📚 or 🐛, a space
 * and a capital letter, matching the PR Title check in
 * `.github/workflows/ci.yml`.
 */
export function exitUnlessValidPrTitle(title: string): void {
  if (!/^(🚀|🔧|📚|🐛) [A-Z]/u.test(title)) {
    exitWithError(
      'The title must start with 🚀, 🔧, 📚 or 🐛, a space and a capital letter.',
    );
  }
}
