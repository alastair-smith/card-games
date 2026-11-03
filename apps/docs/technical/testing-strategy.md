# Testing Strategy

Every pull request runs static checks and four kinds of test, from fastest to slowest. Each catches a different kind of mistake, so a change is checked from its types up to a full game in a real browser.

## Overview

| Check             | Tooling                                                                                                                      | What it checks                                         | CI job               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------- |
| Static checks     | [Biome](https://biomejs.dev), [TypeScript](https://www.npmjs.com/package/typescript)                                         | Lint, formatting and types across the repo             | Lint                 |
| Unit tests        | [Vitest](https://www.npmjs.com/package/vitest), [jsdom](https://www.npmjs.com/package/jsdom)                                 | Functions and components on their own                  | Test                 |
| Story tests       | [Storybook](https://www.npmjs.com/package/@storybook/addon-vitest), [Vitest browser mode](https://vitest.dev/guide/browser/) | Each story renders and its `play` function passes      | Story Tests          |
| Integration tests | [Vitest](https://www.npmjs.com/package/vitest), [Redis](https://redis.io)                                                    | The data layer against a real Redis                    | Integration Tests    |
| E2E tests         | [Playwright](https://www.npmjs.com/package/@playwright/test)                                                                 | A full game of Yaniv in real browsers, against a build | E2E Tests (4 setups) |

The four test jobs only run when a pull request changes the app: `apps/web/`, `packages/`, the root package and workspace files, or the CI workflows. The lint job always runs.

## Static checks

**Tooling:** [Biome](https://biomejs.dev) for linting and formatting, including the Markdown and YAML files, and [TypeScript](https://www.npmjs.com/package/typescript) for type checking each package.

**Run locally** from the repo root:

```bash
pnpm format:fix   # fix lint and formatting
pnpm typecheck    # check types in every package
pnpm lint         # both checks, without fixing, as CI runs them
```

**CI job:** Lint, which runs `pnpm lint`.

Two more checks run on every pull request:

- **Check Diagrams** rebuilds the D2 diagrams and fails if the committed SVGs differ. See [Documentation](./documentation.md)
- **PR Title** checks the title starts with one of the emoji in CLAUDE.md's commit conventions

## Unit tests

**Purpose:** check individual functions and components on their own. These are the fastest tests.

**Tooling:** [Vitest](https://www.npmjs.com/package/vitest) in [jsdom](https://www.npmjs.com/package/jsdom), with [Testing Library](https://www.npmjs.com/package/@testing-library/react) and [jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) for components.

**Scope:** any `*.test.ts` or `*.test.tsx` file in `apps/web`, apart from the integration tests, such as:

- Game state functions, such as playing cards, picking up and calling Yaniv
- Components, such as the hand, turn actions and round summary
- Utilities, such as scoring and sorting cards

**What they don't cover:** layout and styles, which jsdom doesn't render, Redis, or a game across several requests.

**Run locally:**

```bash
pnpm --filter @repo/web test src/path/to/file.test.tsx   # one file
pnpm test                                                # every unit test
```

**CI job:** Test.

## Story tests

**Purpose:** check each component renders in a real browser, in every state its stories show. A story with a `play` function also clicks or types through it and checks the result.

**Tooling:** [Storybook's Vitest addon](https://www.npmjs.com/package/@storybook/addon-vitest) turns each story into a test, run in Chromium through [Vitest browser mode](https://www.npmjs.com/package/@vitest/browser-playwright). The [accessibility addon](https://www.npmjs.com/package/@storybook/addon-a11y) checks each story too, but reports problems as warnings rather than failing the test.

**What they don't cover:** the server, or components wired together beyond what a story renders.

**Run locally:**

```bash
pnpm --filter @repo/web test:stories src/path/to/file.stories.tsx   # one story file
pnpm --filter @repo/web test:stories                                # every story
```

**CI job:** Story Tests.

## Integration tests

**Purpose:** check the data layer against a real Redis, where a mock would hide how Redis orders and stores values.

**Tooling:** [Vitest](https://www.npmjs.com/package/vitest) with [ioredis](https://www.npmjs.com/package/ioredis), against [Redis](https://redis.io).

**Scope:** `*.integration.test.ts` files, which cover the deck and discard pile, such as the deck drawing cards in the order it was created. Each test generates its own game code, so tests don't share state.

**What they don't cover:** the tRPC procedures, the game state functions built on the data layer, or the UI.

**Run locally** from the repo root, which starts Redis in Docker first:

```bash
pnpm test:integration
```

**CI job:** Integration Tests, with Redis as a service container.

## E2E tests

**Purpose:** check a complete game works in real browsers, against a production build with Redis.

**Tooling:** [Playwright](https://www.npmjs.com/package/@playwright/test).

**Scope:** one test plays a full 3-player game of Yaniv, from creating the lobby to the game-over screen. Each player has their own browser context. Player 1 picks the best move each turn and the others the worst, so the game reaches an end.

The test runs in four browser setups: `chromium-desktop`, `chromium-mobile`, `firefox-desktop` and `firefox-mobile`.

**Run locally** in the background, as a run takes a few minutes. Playwright reuses the dev server on port 3000 if it's running:

```bash
pnpm --filter @repo/web test:e2e --project=chromium-desktop
```

**CI job:** E2E Tests, one job per browser setup, each against the build from the Build job. A failing run uploads its Playwright trace.
