import { getAllLobbyConnections } from "../connections.js";

export const pong = async (lobby: string, message: string) => {
  await Promise.all(
    Array.from(getAllLobbyConnections(lobby) || []).map(async (connection) => {
      await connection.send(message);
    }),
  );
};
