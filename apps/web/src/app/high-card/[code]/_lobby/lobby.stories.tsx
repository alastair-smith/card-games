import { GameCode } from "@/types/game"
import Lobby, { LobbyProps } from "./lobby.view"
import { UserId } from "@/types/entities"
import { action } from "@ladle/react"

const handlers = {
  handleNameChange: action('handleNameChange'),
  handleReadyChange: action('handleReadyChange'),
  handleStartGame: action('handleStartGame'),
  handleKick: action('handleKick'),
  handleLeave: action('handleLeave'),
  handleMakeHost: action('handleMakeHost')
} as const satisfies Partial<LobbyProps>;

export const HighCardLobby = () => {
  return <Lobby
    code={'123456' as GameCode}
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: false,
      isUser: true,
      isHost: true
    }]}
    user={{
      isReady: false,
      name: "Frank",
      nameError: ''
    }}
    {...handlers}
  />
};
