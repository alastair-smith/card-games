<p align="center">
  <img src="./apps/web/public/images/home.rectangle.png" alt="Play Cards – a multiplayer card game platform" width="640" />
</p>

<h1 align="center">Play Cards</h1>

<p align="center">
  Play multiplayer card games online with friends — no account required.
</p>

<p align="center">
  <a href="https://github.com/alastair-smith/card-games/actions/workflows/ci.yml">
    <img src="https://github.com/alastair-smith/card-games/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://playcards.games">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fplaycards.games&label=playcards.games" alt="Website status" />
  </a>
  <img src="https://img.shields.io/badge/deployed_on-Render-46E3B7?logo=render&logoColor=white" alt="Deployed on Render" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

---

## About

Play Cards is a browser-based platform for playing classic card games in real time with friends. Start a game, share the lobby link, and everyone joins from their own device — no sign-up, no install.

Hosted at **[playcards.games](https://playcards.games)**.

## Games

| Game | Description |
|------|-------------|
| **Yaniv** | A rummy-style shedding game popular in Israel and South Africa. Draw, discard, and be the first to call Yaniv when your hand value is low enough. |
| **High Card** | A fast, round-based comparison game — highest card wins the round. |
| **Shithead** | The classic shedding game. Play through your hand and be the last one stuck as the shithead. |
| **Fool** | A trick-taking card game. |
| **Blob** | A multiplayer card game for groups. |

## Tech Stack

Built with the [T3 Stack](https://create.t3.gg/), extended for real-time multiplayer:

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| API | [tRPC](https://trpc.io) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Game state | [Redis](https://redis.io/) via [ioredis](https://github.com/redis/ioredis) |
| Monorepo | [Turbo](https://turbo.build/) + [pnpm](https://pnpm.io/) workspaces |
| Containers | [Docker](https://www.docker.com/) + [Caddy](https://caddyserver.com/) (reverse proxy) |
| Testing | [Vitest](https://vitest.dev/) (unit) · [Playwright](https://playwright.dev/) (E2E) |
| Linting | [Biome](https://biomejs.dev/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22
- [pnpm](https://pnpm.io/) v10
- [Docker](https://www.docker.com/)

### Environment setup

Copy the example below into `apps/web/.env`:

```env
AUTH_SECRET=<random-32-char-string>        # JWT signing key — must be at least 32 characters
REDIS_CONNECTION_STRING=redis://localhost:6379
```

`AUTH_SECRET` can be any random 32+ character string. You can generate one with:

```bash
openssl rand -hex 32
```

### Running locally

1. Install dependencies:

    ```bash
    pnpm install
    ```

2. Start the development server (Next.js + Redis in Docker):

    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

    For a multi-pane terminal layout, use the [Zellij](https://zellij.dev/)-based command instead:

    ```bash
    pnpm dev:zellij
    ```

## Building

Build the application for production:

```bash
pnpm build
```

A production Docker image can be built with:

```bash
docker build -t card-games .
```

## Testing

Run the unit test suite:

```bash
pnpm test
```

Run E2E tests (requires Docker for the Redis service):

```bash
pnpm test:e2e
```
