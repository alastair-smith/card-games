# Maintaining the docs

The docs are Markdown files in `apps/docs`, built into a site with [VitePress](https://vitepress.dev): how the app is built under `technical/`, how each game works under `games/`.

## Adding a doc

Link each new doc from [`index.md`](../index.md), and add it to the sidebar in [`.vitepress/config.ts`](https://github.com/alastair-smith/card-games/blob/main/apps/docs/.vitepress/config.ts).

## Running the docs

To run the site locally from the repo root:

```bash
pnpm --filter @repo/docs dev
```

`pnpm --filter @repo/docs build` rebuilds the diagrams, then builds the site into `.vitepress/dist`.

## Diagrams

Diagrams are written in [D2](https://d2lang.com) under [`diagrams/`](https://github.com/alastair-smith/card-games/tree/main/apps/docs/diagrams). After changing a `.d2` file, rebuild the SVGs from the repo root:

```bash
pnpm --filter @repo/docs build:diagrams
```

This also writes a light and a dark copy of each diagram, which aren't committed. The site shows whichever matches its light/dark toggle, as the committed SVGs follow the system colour scheme instead.
