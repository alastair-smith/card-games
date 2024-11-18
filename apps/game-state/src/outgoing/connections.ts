import { initConnections } from "../utils/connections/index.js";

export const {
  addLobby,
  removeLobby,
  getLobby,
  addUserConnection,
  removeUserConnection,
  getUserConnection,
  getAllLobbyConnections
} = initConnections();
