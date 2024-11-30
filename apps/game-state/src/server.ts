import WebSocket, { WebSocketServer } from "ws";
import { env } from "./env.js";
import { createServer } from "http";
import { router } from "./incoming/index.js";

import { parse } from "cookie";

export const startServer = () => {
  const server = createServer();

  const webSocketServer = new WebSocketServer({ server });

  webSocketServer.on("connection", (connection, request) => {
    const cookies = parse(request.headers["cookie"] ?? "");

    connection.on("error", (error) => {
      console.error(`Error: ${error}`);
    });

    connection.on("message", async (message) => {
      const {
        procedure: procedurePath,
        lobby,
        data,
      } = JSON.parse(message.toString());

      const procedure = router[procedurePath];

      if (!procedure) {
        console.error(`Procedure "${procedurePath}" not found.`);
        return;
      }

      if (!cookies.user) {
        // TODO handle this better
        console.error(`User not authenticated.`);
        return;
      }

      console.log(`[Server] Executing procedure: ${procedurePath}`);

      try {
        await procedure.execute({
          user: cookies.user,
          lobby,
          input: data,
        });
      } catch (error) {
        console.error(error);
      }
    });
  });

  server.listen(env.PORT, () => {
    console.log(`Server started on port ${env.PORT}`);
  });
};
