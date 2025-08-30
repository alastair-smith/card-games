'use client';

import debounce from 'lodash/debounce';
import { useCallback, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import LobbyView from './lobby.view';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_READY_UPDATE_DELAY_MS = 300;

export default function Lobby({
  code,
  players,
}: {
  code: GameCode;
  players: Player[];
}) {
  const [user, setUser] = useState(() => {
    const currentPlayer = players.find((player) => player.isUser);

    return {
      isReady: currentPlayer?.isReady ?? false,
      name: currentPlayer?.name ?? '',
      nameError: '',
    };
  });

  const updatePlayerMutation = api.lobby.updatePlayer.useMutation();
  const leaveGameMutation = api.lobby.leaveGame.useMutation();
  const kickPlayerMutation = api.lobby.kickPlayer.useMutation();
  const makeHostMutation = api.lobby.makeHost.useMutation();
  const startGameMutation = api.highCard.startGame.useMutation();

  const debouncedUpdatePlayerName = useCallback(
    debounce((name: string) => {
      updatePlayerMutation.mutate(
        { field: 'name', code, value: name },
        {
          onError: (error) => {
            setUser((prev) => ({ ...prev, nameError: error.message }));
          },
        },
      );
    }, PLAYER_NAME_UPDATE_DELAY_MS),
    [code, updatePlayerMutation],
  );

  const debouncedUpdatePlayerReady = useCallback(
    debounce((isReady: boolean) => {
      updatePlayerMutation.mutate(
        { field: 'isReady', code, value: isReady },
        {
          onError: () => {
            setUser((prev) => ({ ...prev, isReady: !isReady }));
            toast.error('Error updating ready status');
          },
        },
      );
    }, PLAYER_READY_UPDATE_DELAY_MS),
    [code, updatePlayerMutation],
  );

  const handleNameChange = (name: string) => {
    setUser((prev) => ({ ...prev, name, nameError: '' }));
    debouncedUpdatePlayerName(name);
  };

  const handleReadyChange = (isReady: boolean) => {
    setUser((prev) => ({ ...prev, isReady }));
    debouncedUpdatePlayerReady(isReady);
  };

  return (
    <LobbyView
      code={code}
      players={players}
      user={user}
      handleNameChange={handleNameChange}
      handleReadyChange={handleReadyChange}
      handleStartGame={() => {
        startGameMutation.mutate({ code });
      }}
      handleLeave={() => {
        leaveGameMutation.mutate({ code });
      }}
      handleKick={(playerId: UserId) => {
        kickPlayerMutation.mutate({ playerId, code });
      }}
      handleMakeHost={(playerId: UserId) => {
        makeHostMutation.mutate({ playerId, code });
      }}
    />
  );
}
