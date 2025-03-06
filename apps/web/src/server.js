// @ts-check
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { env } from "./env.js";

const greetings = `
\x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m
\x1b[47m\x1b[30m|\x1b[0m\x1b[47m\x1b[30mA _   \x1b[30m|\x1b[0m \x1b[47m\x1b[31m|A     \x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[31m|A_  _ \x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[30m|A .   \x1b[47m\x1b[30m|\x1b[0m
\x1b[47m\x1b[30m|\x1b[0m\x1b[47m\x1b[30m ( )  \x1b[30m|\x1b[0m \x1b[47m\x1b[31m|  /\\  \x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[31m|( \\/ )\x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[30m| /.\\  \x1b[47m\x1b[30m|\x1b[0m
\x1b[47m\x1b[30m|\x1b[0m\x1b[47m\x1b[30m(_'_) \x1b[30m|\x1b[0m \x1b[47m\x1b[31m|  \\/  \x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[31m| \\  / \x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[30m|(_._) \x1b[47m\x1b[30m|\x1b[0m
\x1b[47m\x1b[30m|\x1b[0m\x1b[47m\x1b[30m  |  A\x1b[30m|\x1b[0m \x1b[47m\x1b[31m|     A\x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[31m|  \\/ A\x1b[47m\x1b[30m|\x1b[0m \x1b[47m\x1b[30m|  |  A\x1b[47m\x1b[30m|\x1b[0m
\x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m \x1b[47m\x1b[30m.------.\x1b[0m

   \x1b[93m_____              _    _____                           \x1b[0m
  \x1b[93m/ ____|            | |  / ____|                          \x1b[0m
 \x1b[93m| |     __ _ _ __ __| | | |  __  __ _ _ __ ___   ___  ___ \x1b[0m
 \x1b[93m| |    / _\` | '__/ _\` | | | |_ |/ _\` | '_ \` _ \\ / _ \\/ __|\x1b[0m
 \x1b[93m| |___| (_| | | | (_| | | |__| | (_| | | | | | |  __/\\__ \\\x1b[0m
  \x1b[93m\\_____\\__,_|_|  \\__,_|  \\_____|\\__,_|_| |_| |_|\\___||___/\x1b[0m
`;

const startServer = async () => {
  const nodeEnv = env.NODE_ENV;
  const port = env.PORT;

  const app = next({ dev: nodeEnv === "development" });
  const handle = app.getRequestHandler();

  await app.prepare().then(() => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url ?? "", true);
      void handle(req, res, parsedUrl);
    });

    server.listen(port, () => {
      console.log(greetings);
      console.log(`✓ Ready on http://localhost:${port}`);
    });
  });
};

await startServer();
