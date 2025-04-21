import { UserId } from "@/types/entities";
import { toast } from "../ui/toast";
import Players from "./players.client";

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
    }} />
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
    }} />
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
    }} />
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
    }} />
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
    }} />
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
    }} />
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
    }} />
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
    }} />
);
