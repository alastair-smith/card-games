# Play Cards

This is a web application for playing multiplayer card games online with friends. Start a game and share the lobby link to invite them to join from their own device.

It is hosted at [playcards.games](https://playcards.games).

## Tech Stack

This project is built with the T3 Stack, and includes the following technologies:

- [Next.js](https://nextjs.org)
- [tRPC](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)
- [pnpm](https://pnpm.io/)
- [Turbo](https://turbo.build/)

## Development

To get started, you will need to have `pnpm` and `docker` installed.

1.  Install dependencies:

    ```bash
    pnpm install
    ```

2.  Start the development server:

    ```bash
    pnpm dev
    ```

    This will start the Next.js application and a Redis instance in a Docker container.

    For a better development experience, you can use the `dev:zellij` command:

    ```bash
    pnpm dev:zellij
    ```

    This command uses [Zellij](https://zellij.dev/) to manage multiple terminal sessions in a structured way, providing a more organized and efficient development workflow.

## Building

To build the application for production, run the following command:

```bash
pnpm build
```

## Testing

To run the tests, run the following command:

```bash
pnpm test
```
