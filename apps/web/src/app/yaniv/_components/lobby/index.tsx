'use client';

import debounce from 'lodash/debounce';
import { useCallback, useRef, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';
import LobbyView from './lobby.view';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_READY_UPDATE_DELAY_MS = 300;
const PLAYER_COLOR_UPDATE_DELAY_MS = 300;

export default function Lobby({
  code,
  players,
}: {
  code: GameCode;
  players: Player[];
}) {
  const [user, setUser] = useState<{
    isReady: boolean;
    name: string;
    nameError: string;
    color: PlayerColor;
  }>(() => {
    const currentPlayer = players.find((player) => player.isUser);

    if (!currentPlayer) {
      throw new Error('Current player not found in lobby');
    }

    return {
      isReady: currentPlayer.isReady,
      name: currentPlayer.name,
      nameError: '',
      color: currentPlayer.color,
    };
  });

  // The colour the server has last confirmed, so a failed update reverts to the
  // real persisted colour rather than an intermediate optimistic one.
  const confirmedColor = useRef(user.color);

  const updatePlayerMutation = api.lobby.updatePlayer.useMutation();
  const leaveGameMutation = api.lobby.leaveGame.useMutation();
  const kickPlayerMutation = api.lobby.kickPlayer.useMutation({
    onError: () => {
      toast.error('Error kicking player.');
    },
  });
  const makeHostMutation = api.lobby.makeHost.useMutation();
  const startGameMutation = api.yaniv.startGame.useMutation();

  const debouncedUpdatePlayerName = useCallback(
    debounce((name: string) => {
      updatePlayerMutation.mutate(
        { field: 'name', code, playerName: name },
        {
          onError: (error) => {
            setUser((prev) => ({ ...prev, nameError: error.message }));
          },
        },
      );
    }, PLAYER_NAME_UPDATE_DELAY_MS),
    [],
  );

  const debouncedUpdatePlayerReady = useCallback(
    debounce((isReady: boolean) => {
      updatePlayerMutation.mutate(
        { field: 'isReady', code, isReady },
        {
          onError: () => {
            setUser((prev) => ({ ...prev, isReady: !isReady }));
            toast.error('Error updating ready status.');
          },
        },
      );
    }, PLAYER_READY_UPDATE_DELAY_MS),
    [],
  );

  const debouncedUpdatePlayerColor = useCallback(
    debounce((color: PlayerColor) => {
      updatePlayerMutation.mutate(
        { field: 'color', code, color },
        {
          onSuccess: () => {
            confirmedColor.current = color;
          },
          onError: () => {
            setUser((prev) => ({ ...prev, color: confirmedColor.current }));
            toast.error('Error updating colour.');
          },
        },
      );
    }, PLAYER_COLOR_UPDATE_DELAY_MS),
    [],
  );

  const handleNameChange = (name: string) => {
    setUser((prev) => ({ ...prev, name, nameError: '' }));
    debouncedUpdatePlayerName(name);
  };

  const handleColorChange = (color: string) => {
    // The picker only ever offers palette colours; validate to satisfy the
    // PlayerColor type (and guard against anything unexpected).
    const nextColor = playerColorSchema.parse(color);
    setUser((prev) => ({ ...prev, color: nextColor }));
    debouncedUpdatePlayerColor(nextColor);
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
      handleColorChange={handleColorChange}
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
