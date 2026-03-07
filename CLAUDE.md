# Stack
Next.js (App Router), tRPC, TypeScript, Redis (game state), Tailwind.
Multiplayer card game — server actions transmit state to clients.

# Commands

## Formatting
Fix all lint and formatting issues (run from repo root):
```
pnpm run format:fix
```
To fix a specific file only:
```
pnpm exec biome check --write path/to/file
```

## Type checking
Check types across all packages (run from repo root):
```
pnpm run typecheck
```
Or just the web app:
```
pnpm --filter @repo/web typecheck
```

## Tests
Always run a specific test file first rather than the full suite — it's faster and produces less output:
```
pnpm --filter @repo/web test -- run src/path/to/file.test.tsx
```
Use `--reporter=dot` when you only need a pass/fail summary:
```
pnpm --filter @repo/web test -- run --reporter=dot src/path/to/file.test.tsx
```
Run the full suite only when needed:
```
pnpm test
```

# Pull requests

When raising a PR:
- Use the GitHub MCP tool (`mcp__github__create_pull_request`) to create the PR
- Use the template at `.github/pull_request_template.md` for the PR body
- Strip all HTML comments (`<!-- ... -->`) from the PR body before submitting — the PR description is used as the squash-merge commit message
- Omit the Details section entirely if there is nothing to add
- Title should be short and descriptive (under 70 characters), prefixed with one emoji:
  - 🚀 feature
  - 🔧 chore / maintenance
  - 📚 documentation only
  - 🐛 bug fix
- Example: `🚀 Create Yaniv components`

# Code conventions

## Imports
Use the `~` alias for all imports from `src/`:
```ts
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';
```

## Quotes
Single quotes throughout (enforced by Biome).

## Classnames
Use `cn()` (clsx + tailwind-merge) for all `className` composition:
```ts
import { cn } from '~/utils/cn';
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Branded types
Primitive IDs and constrained strings use branded types — don't use plain `string`:
```ts
// types defined in ~/types/entities.ts
userId: UserId
name: PlayerName
code: GameCode
```
Cast raw strings when constructing test data or initial values: `'abc' as UserId`.

## Types and schemas
New domain types should be paired with a Zod schema in the same file:
```ts
export const fooSchema = z.object({ ... });
export type Foo = z.infer<typeof fooSchema>;
```

## Component prop naming
Action callbacks: prop is `on<Action>`, the handler passed in is `handle<Noun><Action>`:
```ts
// prop definition
onCardClick: (card: Card) => void
// passed in by parent
<Hand onCardClick={handleCardClick} />
<Hand onCardClick={handleDiscardCardClick} />
```

Boolean props: `is<Noun><State>`:
```ts
isYanivCalled: boolean
isHighlighted: boolean
isFiftyScoreHalved: boolean
```

## Component files
Components live in kebab-case directories with an `index.tsx` entry point:
```
components/my-component/index.tsx
```

# Testing

## Test naming
- Describe behavior in plain language — never reference prop or parameter names in test titles
- ✓ "shows Yaniv called marquee when Yaniv has been called"
- ✗ "shows marquee when isYanivCalled is true"
- ✓ "shows halved indicator for 50 when fifty score has been halved"
- ✗ "shows halved indicator for 50 when isFiftyScoreHalved is true"
- ✓ "calls the Yaniv handler when Yaniv is called"
- ✗ "calls the Yaniv handler when Yaniv! is clicked"

## Assertions
- Use `@testing-library/jest-dom` for DOM assertions — it's the RTL-recommended companion library
- `toBeInTheDocument()` for presence, `not.toBeInTheDocument()` for absence
- `toHaveBeenCalledOnce()` for callback assertions (Vitest spy matcher)
- Prefer accessible queries (`getByRole`, `getByText`, `getByLabelText`) over `getByTestId` — test IDs are a last resort for when no semantic query applies

## Structure
- Group related tests in nested `describe` blocks by feature/stage, not by prop
- Fresh `vi.fn()` instances per test when asserting a handler was called
- Shared `vi.fn()` (e.g. `noop`) is fine for handlers that are not under test

## Mocking
- Mock complex sub-components to test parent logic in isolation
- Use `data-testid="card-{suit}-{rank}"` on mocked card components for reliable selection
- Mock layout wrappers (e.g. `GameLayout`) with a simple children passthrough
- Mock unrelated interactive sub-components (e.g. `EmojiReactions`, `HowToDialog`) with stubs
