# Claude

## Stack

Next.js (App Router), tRPC, TypeScript, Redis (game state), Tailwind.
Multiplayer card game — server actions transmit state to clients.

## Commands

### Running commands

- Don't `cd` first; the shell already starts in the repo root
- Use the scripts in `scripts/` for GitHub lookups rather than `gh api`
- Run one plain command per call, exactly as documented here or in a skill.
  Read-only commands (`git status`, `git log`, `gh issue view`, `grep`, …) and
  the commands in `.claude/settings.json` run without a permission prompt, but
  extra shell around them can make them prompt: `cd … &&`, `2>&1`, `$?` and
  other variables, unquoted globs, loops and inline `python3`. For several
  independent commands, make parallel calls instead

### Formatting

Fix all lint and formatting issues (run from repo root):

```bash
pnpm format:fix
```

To fix a specific file only:

```bash
pnpm format:fix path/to/file
```

If you really need to run a check without autofix you can use:

```bash
pnpm format:check
```

Or for a specific file

```bash
pnpm format:check /path/to/file
```

### Type checking

Check types across all packages (run from repo root):

```bash
pnpm typecheck
```

Or just the web app:

```bash
pnpm --filter @repo/web typecheck
```

### Tests

Always run a specific unit test file first rather than the full suite — it's faster and produces less output:

```bash
pnpm --filter @repo/web test src/path/to/file.test.tsx
```

Do not put `--` before the path — that stops the path being treated as a filter and runs the whole suite.

Use `--reporter=dot` when you only need a pass/fail summary:

```bash
pnpm --filter @repo/web test --reporter=dot src/path/to/file.test.tsx
```

Run the full suite only when needed:

```bash
pnpm test
```

## Branches

All work that changes files happens on a branch for an issue. When a prompt
asks for changes but doesn't reference an issue, before starting:

1. Search for an existing issue that covers the work, and file one with the
   `manage-issue` skill if there isn't one
2. Create a branch for it, as below — unless the issue already has an open PR,
   in which case work on that PR's branch

Create branches for an issue with `scripts/create-branch.sh`. It runs
`gh issue develop`, so the branch is linked to the issue on GitHub. A branch
created with plain `git checkout -b` and given the same name is not linked.

It names the branch `i-<issue number>/<short-description>`, branches from
`main` and checks it out:

```bash
./scripts/create-branch.sh 123 short-description
```

## Commits

Start the subject with the same emoji as PR titles:

- 🚀 features, and any change to game rules or user-visible behaviour
- 🔧 chores, maintenance, refactoring, tests, tooling
- 📚 documentation only
- 🐛 fixing something genuinely broken — not an intentional behaviour change

Don't add `Claude-Session:` trailers or any other Claude attribution lines.

## Pull requests

Use the `raise-pr` skill when opening a PR or updating its title or description.

## Code conventions

### Naming

Use full, descriptive names — no single-character variables or abbreviations,
including arrow function parameters and loop variables:

```ts
players.map((player) => player.name);
```

### Comments

Keep comments to a minimum and let names carry the meaning
(`useWaitForServerValue`, `DEFAULT_HAND_SIZE`).

- Do comment *why* when a decision isn't obvious from the code
- Explain *how* only in code that is rarely touched but important, such as auth
- Don't record history — no `// added to fix the issue in i-123`; that belongs
  in the PR description

### Imports

Use the `~` alias for all imports from `src/`:

```ts
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';
```

### Quotes

Single quotes throughout (enforced by Biome).

### Classnames

Use `cn()` (clsx + tailwind-merge) for all `className` composition:

```ts
import { cn } from '~/utils/cn';
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

### Branded types

Primitive IDs and constrained strings use branded types — avoid using plain `string`:

```ts
// types defined in ~/types/entities.ts
userId: UserId
name: PlayerName
code: GameCode
```

Cast raw strings when constructing test data or initial values: `'abc' as UserId`.

### Type assertions

Avoid `as` casts — they silence the compiler rather than prove the types line
up. Casting a raw value to a branded type and `as const` are fine. Elsewhere,
give values their type with an annotation or `satisfies`:

```ts
const roundScores: RoundScore[] = [];

const PLAYER_COLORS = {
  plum: { name: 'Plum', value: 'hsl(295 55% 50%)' },
} as const satisfies Record<string, { name: string; value: string }>;
```

Use `satisfies` when an annotation would widen the type and lose detail you
need, such as an object's exact keys.

### Types and schemas

New domain types should be paired with a Zod schema in the same file:

```ts
export const fooSchema = z.object({ ... });
export type Foo = z.infer<typeof fooSchema>;
```

### Stored state

Game and lobby state lives in Redis and is short-lived, so schema changes do not
need to be backwards compatible — games already in progress can break. Add new
fields as required, not optional or defaulted, and don't add fallbacks for
records written before the change.

### State operations

Every exported function in `server/state/**` that updates an existing store in
Redis wraps its whole body in `withLock` from `~/server/state/lib/locks`, so
concurrent requests can't overwrite each other:

```ts
withLock('yaniv', code, async () => { ... });
```

Creating a new store doesn't need a lock on that store — nothing else can be
using it yet.

### Component prop naming

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

### Component files

Components live in kebab-case directories with an `index.tsx` entry point:

```bash
components/my-component/index.tsx
```

Give new UI elements their own component file rather than adding JSX inline
to an existing component.

## Testing

### Test naming
- Describe behavior in plain language — never reference prop or parameter names in test titles
- ✓ "shows Yaniv called marquee when Yaniv has been called"
- ✗ "shows marquee when isYanivCalled is true"
- ✓ "shows halved indicator for 50 when fifty score has been halved"
- ✗ "shows halved indicator for 50 when isFiftyScoreHalved is true"
- ✓ "calls the Yaniv handler when Yaniv is called"
- ✗ "calls the Yaniv handler when Yaniv! is clicked"

### Assertions
- Use `@testing-library/jest-dom` for DOM assertions — it's the RTL-recommended companion library
- `toBeInTheDocument()` for presence, `not.toBeInTheDocument()` for absence
- `toHaveBeenCalledOnce()` for callback assertions (Vitest spy matcher)
- Prefer accessible queries (`getByRole`, `getByText`, `getByLabelText`) over `getByTestId` — test IDs are a last resort for when no semantic query applies

### Structure
- Group related tests in nested `describe` blocks by feature/stage, not by prop
- Fresh `vi.fn()` instances per test when asserting a handler was called
- Shared `vi.fn()` (e.g. `noop`) is fine for handlers that are not under test
- Test only what the unit adds — don't re-test its dependencies or third-party libraries
- Share test helpers from `~/test-utils/` rather than copying them between files

### Test data
- Reuse the test data builders in `~/test-utils/` (e.g. `buildPlayer`, `buildInProgressState`) instead of writing full object literals, passing only the fields the test cares about
- If a test needs a shape no builder covers, add or extend a builder there
- When a new field is added, give the builder a default value for it rather than updating every test

### Mocking
- Mock complex sub-components to test parent logic in isolation
- Use `data-testid="card-{suit}-{rank}"` on mocked card components for reliable selection
- Mock layout wrappers (e.g. `GameLayout`) with a simple children passthrough
- Mock unrelated interactive sub-components (e.g. `EmojiReactions`, `HowToDialog`) with stubs
