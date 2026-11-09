---

name: take-screenshots
description: Take screenshots of a page, story, dialog or docs page at larger and smaller screen sizes, and measure where elements sit across stories. Use whenever checking a layout or how a change looks, at any point in the work, or capturing screenshots for a PR.
---

# Take screenshots

Start the server you need with the `dev-servers` skill: the app (port 3000),
Storybook (port 6006) or the docs site (port 5173).

```bash
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --path / --name home
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --path / --name home-footer --scroll-to-bottom
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --path / --name home-page --full-page
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --story yaniv-scorecard--start --name scorecard
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --story yaniv-hand-size-dialog--dealer --dialog --name hand-size-dialog
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --storybook-docs yaniv-hand--docs --name hand-docs
./.claude/skills/take-screenshots/scripts/take-screenshots.ts --docs /games/lobby --name docs-lobby --theme dark
```

It saves `<name>-desktop.png` (1280×800) and `<name>-mobile.png` (390×844)
under `.pr-screenshots/<branch name>/` at the repo root (gitignored), and
prints their paths. It only runs on an issue branch. `--name` is lowercase
kebab-case, describing what's shown.

- **Page:** the visible screen by default. Pass `--scroll-to-bottom` when the
  change is at the foot of the page, or `--full-page` for the whole page.
  Both also work on game pages, which scroll inside `main` rather than the
  window
- **Story:** just the component, framed by the felt background. The story ID
  follows `?path=/story/` in Storybook's URL. Prefer a story when the change
  is to one component, since it needs no game set up
- **Dialog:** pass `--dialog` with `--story` to capture an open dialog, which
  renders outside the story's own area. The story's `play` function must
  open it and leave it open
- **Storybook docs:** `--storybook-docs` takes the ID that follows
  `?path=/docs/` in Storybook's URL, such as a component's docs or an MDX
  page, and works like `--path`
- **Docs:** `--docs` takes a path on the docs site and works like `--path`
- **Dark mode:** screenshots are light by default; pass `--theme dark` for
  dark mode. Only the docs site and Storybook's docs pages have a dark theme
  so far, so the script rejects it elsewhere

Look at each screenshot before relying on it, and retake any that shows a
loading or empty state.

## Measure layout shift

To check that elements stay put between states, give two or more stories
showing those states and a CSS selector for the elements to compare:

```bash
./.claude/skills/take-screenshots/scripts/measure-stories.ts \
  --story shithead-player-area--five-players-longest-names \
  --story shithead-player-area--five-players-all-finished \
  --selector '.rounded.border-2, [class*="pb-[0.5em]"]'
```

At each of the two sizes it prints where the selector's matches sit in the
first story, then a `DIFFERS` line for each element that sits elsewhere or is
a different size in a later story, or `No differences`. Elements are compared
in page order. Only elements the selector matches are checked, so make it
cover every key element, including the content below or beside whatever
changes. Comparing screenshots by eye misses small shifts, so measure before
saying that nothing moves.
