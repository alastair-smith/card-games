import debounce from 'lodash/debounce';
import { useCallback, useRef, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { useWaitForServerValue } from '~/hooks/use-wait-for-server-value';
import { api } from '~/trpc/react';
import { MIN_NAME_LENGTH, type UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_COLOR_UPDATE_DELAY_MS = 300;

export type LobbyUser = {
  isReady: boolean;
  name: string;
  nameError: string;
  color: PlayerColor;
};

export function useLobbyPlayer({
  code,
  players,
}: {
  code: GameCode;
  players: Player[];
}) {
  const currentPlayer = players.find((player) => player.isUser);

  if (!currentPlayer) {
    throw new Error('Current player not found in lobby');
  }

  const [user, setUser] = useState<Omit<LobbyUser, 'isReady'>>(() => ({
    name: currentPlayer.name,
    nameError: '',
    color: currentPlayer.color,
  }));

  const confirmedColor = useRef(user.color);

  const waitForIsReady = useWaitForServerValue(currentPlayer.isReady);

  const updatePlayerMutation = api.lobby.updatePlayer.useMutation();

  const updateReadyMutation = api.lobby.updatePlayer.useMutation({
    scope: { id: `player-ready-${code}` },
    onSuccess: (_data, variables) =>
      variables.field === 'isReady'
        ? waitForIsReady(variables.isReady)
        : undefined,
    onError: () => {
      toast.error('Error updating ready status.');
    },
  });

  const leaveGameMutation = api.lobby.leaveGame.useMutation();
  const kickPlayerMutation = api.lobby.kickPlayer.useMutation({
    onError: () => {
      toast.error('Error kicking player.');
    },
  });
  const makeHostMutation = api.lobby.makeHost.useMutation();

  const readyUpdate = updateReadyMutation.variables;
  const pendingIsReady =
    updateReadyMutation.isPending && readyUpdate?.field === 'isReady'
      ? readyUpdate.isReady
      : undefined;
  const isReady = pendingIsReady ?? currentPlayer.isReady;

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
    if (name.length < MIN_NAME_LENGTH) {
      debouncedUpdatePlayerName.cancel();
      return;
    }
    debouncedUpdatePlayerName(name);
  };

  const handleColorChange = (color: string) => {
    const nextColor = playerColorSchema.parse(color);
    setUser((prev) => ({ ...prev, color: nextColor }));
    debouncedUpdatePlayerColor(nextColor);
  };

  const handleReadyChange = (nextIsReady: boolean) => {
    updateReadyMutation.mutate({
      field: 'isReady',
      code,
      isReady: nextIsReady,
    });
  };

  const handleLeave = () => {
    leaveGameMutation.mutate({ code });
  };

  const handleKick = (playerId: UserId) => {
    kickPlayerMutation.mutate({ playerId, code });
  };

  const handleMakeHost = (playerId: UserId) => {
    makeHostMutation.mutate({ playerId, code });
  };

  return {
    user: { ...user, isReady },
    handleNameChange,
    handleColorChange,
    handleReadyChange,
    handleLeave,
    handleKick,
    handleMakeHost,
  };
}
