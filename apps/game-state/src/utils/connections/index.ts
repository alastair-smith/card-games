import { GameInstance, User } from "@repo/database"

type LobbyId = GameInstance['joinCode'];
type UserId = User['id'];
type Lobby = Map<UserId, WebSocket>;

export const initConnections = () => {
  const liveConnections: Map<LobbyId, Lobby> = new Map();

  // lobby management

  const addLobby = (lobbyId: LobbyId) => {
    liveConnections.set(lobbyId, new Map());
  };

  const removeLobby = (lobbyId: LobbyId) => {
    // TODO clear connections
    liveConnections.delete(lobbyId);
  }

  const getLobby = (lobbyId: LobbyId) => {
    return liveConnections.get(lobbyId);
  }

  // connection management

  const addUserConnection = (lobbyId: LobbyId, userId: UserId, connection: WebSocket) => {
    const lobby = getLobby(lobbyId);

    if (!lobby) {
      addLobby(lobbyId);
    }

    lobby?.set(userId, connection);
  };

  const removeUserConnection = (lobbyId: LobbyId, userId: UserId) => {};

  const getUserConnection = (lobbyId: LobbyId, userId: UserId) => {};

  const getAllLobbyConnections = (lobbyId: LobbyId) => {
    return getLobby(lobbyId)?.values();
  };

  return {
    addLobby,
    removeLobby,
    getLobby,
    addUserConnection,
    removeUserConnection,
    getUserConnection,
    getAllLobbyConnections
  }
}

