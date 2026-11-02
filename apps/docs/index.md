# Documentation

Docs for [Play Cards](https://playcards.games), a platform for playing card games in real time with friends. For an overview of the project, see the [README](../../README.md).

## Technical

- [Getting started](./technical/getting-started.md) — prerequisites, running the app locally and other scripts
- [Architecture](./technical/architecture.md) — how the browser, server and Redis fit together, auth and events
- [Testing strategy](./technical/testing-strategy.md) — the testing tiers, what each covers and when it runs

## Games

- [Lobby](./games/lobby.md) — creating and joining a game
- [Yaniv](./games/yaniv.md) — the flow of a game, from dealing to scoring

## Diagrams

Diagrams are written in [D2](https://d2lang.com) under [`diagrams/`](./diagrams). After changing a `.d2` file, rebuild the SVGs from the repo root:

```bash
pnpm --filter @repo/docs build:diagrams
```
