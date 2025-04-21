import { GameCode } from "@/types/game"
import Lobby from "./lobby.view"
import { UserId } from "@/types/entities"
import { toast } from "sonner"

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
    handleNameChange={() => {
      toast.success('name changed')
    }}
    handleReadyChange={() => {
      toast.success('ready')
    }}
    handleStartGame={() => {
      toast.success('game started')
    }}
    handleKick={(id: UserId) => {
      toast.success(`kicked ${id}`)
    }}
    handleLeave={(id: UserId) => {
      toast.success(`leave ${id}`)
    }}
    handleMakeHost={(id: UserId) => {
      toast.success(`make host ${id}`)
    }}
  />
};
