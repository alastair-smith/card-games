# Project Overview

This is a T3 Stack project for playing multiplayer card games online. It uses Next.js for the frontend and backend, tRPC for API communication, and Tailwind CSS for styling. The project is set up as a monorepo using pnpm workspaces and turbo for task running. It also uses Docker for background services.

The main application is in the `apps/web` directory. It's a Next.js app with a custom server. The application uses tRPC for type-safe API routes. The tRPC routers are defined in `apps/web/src/server/api/routers`. The two main routers are `lobby` and `highCard`.

# Building and Running

## Prerequisites

*   pnpm
*   Docker

## Development

To run the development server, use the following command:

```bash
pnpm dev
```

This will start the Next.js application and any background services (like Redis) in a Docker container.

There are also scripts for running the development environment with `tmux` or `zellij`:

```bash
pnpm dev:tmux
pnpm dev:zellij
```

## Building

To build the application for production, use the following command:

```bash
pnpm build
```

## Testing

To run the tests, use the following command:

```bash
pnpm test
```

# Development Conventions

## Linting and Formatting

This project uses Biome for linting and formatting. To check for issues, run:

```bash
pnpm format:check
```

To fix issues, run:

```bash
pnpm format:fix
```

## Type Checking

To check for type errors, run:

```bash
pnpm typecheck
```

## Git

The project has a pull request template in `.github/pull_request_template.md`.
