# Documentation

Docs for [Play Cards](https://playcards.games), a platform for playing card games in real time with friends. For an overview of the project, see the [README](https://github.com/alastair-smith/card-games#readme).

## Technical

- [Getting started](./technical/getting-started.md) — prerequisites, running the app locally and other scripts
- [Architecture](./technical/architecture.md) — how the browser, server and Redis fit together, auth and events
- [Testing strategy](./technical/testing-strategy.md) — the testing tiers, what each covers and when it runs

## Games

- [Lobby](./games/lobby.md) — creating and joining a game, and what players and the host can do before it starts
- [Yaniv](./games/yaniv.md) — the flow of a game, from dealing to scoring

## Running the docs

The docs are built into a site with [VitePress](https://vitepress.dev). To run it locally from the repo root:

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
