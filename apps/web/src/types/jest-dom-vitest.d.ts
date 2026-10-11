import 'vitest';

declare module 'vitest' {
  // Vitest 5's browser-mode types declare an exact-match `toHaveTextContent`
  // without RegExp on every assertion, hiding jest-dom's. Unit tests run
  // jest-dom's matcher, which accepts a RegExp, so restore its signature.
  interface Assertion<R, T> {
    toHaveTextContent(
      text: string | number | RegExp,
      options?: { normalizeWhitespace: boolean },
    ): R;
  }
}
