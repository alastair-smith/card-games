# Getting Started

## Prerequisites

Exact versions are specified in the [node-version](../../../.node-version) and [tool-versions](../../../.tool-versions) files. Tools like [mise](https://mise.jdx.dev/) or [asdf](https://asdf-vm.com/guide/getting-started.html) can help with managing the versions.

- [Node.js](https://nodejs.org/) v24
- [pnpm](https://pnpm.io/) v10
- [Docker](https://www.docker.com/)

## Running Locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server (Next.js + Redis in Docker):

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Other Scripts

| Command                               | Description                                          |
| :------------------------------------ | :--------------------------------------------------- |
| `pnpm build`                          | Make a production build                              |
| `pnpm start`                          | Start the production server (requires a `.env` file) |
| `pnpm test`                           | Run unit tests                                       |
| `pnpm test:integration`               | Run integration tests                                |
| `pnpm --filter @repo/web test:e2e`    | Run E2E tests (headless)                             |
| `pnpm --filter @repo/web test:e2e:ui` | Run E2E tests (With UI)                              |
| `pnpm typecheck`                      | Verify types                                         |
| `pnpm format:check`                   | Verify formatting                                    |
| `pnpm format:fix`                     | Fix formatting issues                                |
