import WebSocket, { WebSocketServer } from 'ws';
import { env } from './env.js';
import {createServer} from 'http';
import { router } from './router/index.js';

export const startServer = () => {
  const server = createServer();

  const webSocketServer = new WebSocketServer({ server });
  
  webSocketServer.on('connection', (connection) => {
    connection.on('error', (error) => {
      console.error(`Error: ${error}`);
    });
  
    connection.on('message', async (message) => {
      const { procedure: procedurePath, data } = JSON.parse(message.toString());

      const procedure = router[procedurePath];

      if (!procedure) {
        console.error(`Procedure "${procedurePath}" not found.`);
        return;
      }

      console.log(`[Server] Executing procedure: ${procedurePath}`);

      try {
        await procedure.execute(data);
      } catch (error) {
        console.error(error)
      }
    });
  });

  server.listen(env.PORT, () => {
    console.log(`Server started on port ${env.PORT}`);
  });
}
