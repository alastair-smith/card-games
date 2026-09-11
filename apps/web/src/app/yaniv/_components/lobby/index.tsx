'use client';

import debounce from 'lodash/debounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import { type HandSize, handSizeSchema } from '~/types/games/yaniv';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';
import LobbyView from './lobby.view';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_READY_UPDATE_DELAY_MS = 300;
const PLAYER_COLOR_UPDATE_DELAY_MS = 300;
const HAND_SIZE_UPDATE_DELAY_MS = 300;

export default function Lobby({
  code,
  players,
  handSize,
}: {
  code: GameCode;
  players: Player[];
  handSize: HandSize;
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

  // Shown straight away on click, rather than waiting for the server broadcast
  const [selectedHandSize, setSelectedHandSize] = useState(handSize);

  const confirmedColor = useRef(user.color);
  const confirmedHandSize = useRef(handSize);

  // Keep up with changes made by whoever is host
  useEffect(() => {
    setSelectedHandSize(handSize);
    confirmedHandSize.current = handSize;
  }, [handSize]);

  const updatePlayerMutation = api.lobby.updatePlayer.useMutation();
  const leaveGameMutation = api.lobby.leaveGame.useMutation();
  const kickPlayerMutation = api.lobby.kickPlayer.useMutation({
    onError: () => {
      toast.error('Error kicking player.');
    },
  });
  const makeHostMutation = api.lobby.makeHost.useMutation();
  const startGameMutation = api.yaniv.startGame.useMutation();
  const updateSettingsMutation = api.yaniv.updateSettings.useMutation();

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

  const debouncedUpdateHandSize = useCallback(
    debounce((nextHandSize: HandSize) => {
      updateSettingsMutation.mutate(
        { code, handSize: nextHandSize },
        {
          onSuccess: () => {
            confirmedHandSize.current = nextHandSize;
          },
          onError: () => {
            setSelectedHandSize(confirmedHandSize.current);
            toast.error('Error updating settings.');
          },
        },
      );
    }, HAND_SIZE_UPDATE_DELAY_MS),
    [],
  );

  const handleNameChange = (name: string) => {
    setUser((prev) => ({ ...prev, name, nameError: '' }));
    debouncedUpdatePlayerName(name);
  };

  const handleColorChange = (color: string) => {
    const nextColor = playerColorSchema.parse(color);
    setUser((prev) => ({ ...prev, color: nextColor }));
    debouncedUpdatePlayerColor(nextColor);
  };

  const handleHandSizeChange = (newHandSize: string) => {
    const nextHandSize = handSizeSchema.parse(Number(newHandSize));

    setSelectedHandSize(nextHandSize);
    debouncedUpdateHandSize(nextHandSize);
  };

  const handleReadyChange = (isReady: boolean) => {
    setUser((prev) => ({ ...prev, isReady }));
    debouncedUpdatePlayerReady(isReady);
  };

  return (
    <LobbyView
      code={code}
      players={players}
      handSize={selectedHandSize}
      user={user}
      handleNameChange={handleNameChange}
      handleReadyChange={handleReadyChange}
      handleColorChange={handleColorChange}
      handleHandSizeChange={handleHandSizeChange}
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
