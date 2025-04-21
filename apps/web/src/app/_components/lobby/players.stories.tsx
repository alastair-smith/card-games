import { MAX_NAME_LENGTH, PlayerName, UserId } from "@/types/entities";
import { toast } from "../ui/toast";
import Players from "./players.view";

export const MinPlayersNotMet = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: false,
      isUser: true,
      isHost: true
    }]}
    minPlayers={4}
    maxPlayers={6}
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
);

export const MinPlayersMet = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: false,
      isUser: false,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: "Roz",
      isReady: false,
      isUser: true,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: false,
      name: "Roz",
      nameError: ""
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
);

export const MaxPlayers = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: false,
      isUser: false,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: "Roz",
      isReady: false,
      isUser: true,
      isHost: false
    },
    {
      id: '3' as UserId,
      name: "Niles",
      isReady: false,
      isUser: false,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: false,
      name: "Roz",
      nameError: ""
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
);

export const SomePlayersReady = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: true,
      isUser: true,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: "Roz",
      isReady: true,
      isUser: false,
      isHost: false
    },
    {
      id: '3' as UserId,
      name: "Niles",
      isReady: false,
      isUser: false,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: "Frank",
      nameError: ""
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
);

export const AllPlayersReadyIsHost = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: true,
      isUser: true,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: "Roz",
      isReady: true,
      isUser: false,
      isHost: false
    },
    {
      id: '3' as UserId,
      name: "Niles",
      isReady: true,
      isUser: false,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: "Frank",
      nameError: ""
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
);

export const AllPlayersReadyIsNotHost = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: true,
      isUser: false,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: "Roz",
      isReady: true,
      isUser: true,
      isHost: false
    },
    {
      id: '3' as UserId,
      name: "Niles",
      isReady: true,
      isUser: false,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: "Roz",
      nameError: ""
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
);

export const AllPlayersReadyButNotEnough = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: true,
      isUser: true,
      isHost: true
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: "Frank",
      nameError: ""
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
)

export const NameError = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: "Frank",
      isReady: true,
      isUser: true,
      isHost: true
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: "",
      nameError: "Min length not met"
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
);

const longName = Array.from({ length: MAX_NAME_LENGTH }).map(() => 'W').join('') as PlayerName;

export const LongPlayerNames = () => (
  <Players
    players={[{
      id: '1' as UserId,
      name: longName,
      isReady: true,
      isUser: true,
      isHost: true
    },
    {
      id: '2' as UserId,
      name: longName,
      isReady: true,
      isUser: false,
      isHost: false
    },
    {
      id: '3' as UserId,
      name: longName,
      isReady: true,
      isUser: false,
      isHost: false
    }]}
    minPlayers={2}
    maxPlayers={3}
    user={{
      isReady: true,
      name: longName,
      nameError: ""
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
)
