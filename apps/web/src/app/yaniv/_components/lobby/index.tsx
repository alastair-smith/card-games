'use client';

import debounce from 'lodash/debounce';
import { useCallback, useRef, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { useWaitForServerValue } from '~/hooks/use-wait-for-server-value';
import { api } from '~/trpc/react';
import { MIN_NAME_LENGTH, type UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import type {
  HandSizeRange,
  HandSizeSetting,
  Settings,
} from '~/types/games/yaniv';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';
import LobbyView from './lobby.view';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_COLOR_UPDATE_DELAY_MS = 300;

export default function Lobby({
  code,
  players,
  settings,
}: {
  code: GameCode;
  players: Player[];
  settings: Settings;
}) {
  const currentPlayer = players.find((player) => player.isUser);

  if (!currentPlayer) {
    throw new Error('Current player not found in lobby');
  }

  const [user, setUser] = useState<{
    name: string;
    nameError: string;
    color: PlayerColor;
  }>(() => ({
    name: currentPlayer.name,
    nameError: '',
    color: currentPlayer.color,
  }));

  const confirmedColor = useRef(user.color);

  const waitForIsReady = useWaitForServerValue(currentPlayer.isReady);
  const waitForSettings = useWaitForServerValue(settings);

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
  // Mutations in one scope run in order, so the game starts only once every
  // settings change before it has been saved
  const settingsScope = { id: `settings-${code}` };
  const startGameMutation = api.yaniv.startGame.useMutation({
    scope: settingsScope,
  });
  const updateSettingsMutation = api.yaniv.updateSettings.useMutation({
    scope: settingsScope,
    onSuccess: (_data, variables) => waitForSettings(variables.settings),
    onError: () => {
      toast.error('Error updating settings.');
    },
  });

  const readyUpdate = updateReadyMutation.variables;
  const pendingIsReady =
    updateReadyMutation.isPending && readyUpdate?.field === 'isReady'
      ? readyUpdate.isReady
      : undefined;
  const isReady = pendingIsReady ?? currentPlayer.isReady;

  const pendingSettings = updateSettingsMutation.isPending
    ? updateSettingsMutation.variables?.settings
    : undefined;
  const selectedSettings = pendingSettings ?? settings;

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

  // Each change is a single step, and builds on any change still being saved,
  // as the settings updates run one at a time
  const handleHandSizeChange = (newHandSize: HandSizeSetting) => {
    updateSettingsMutation.mutate({
      code,
      settings: { ...selectedSettings, handSize: newHandSize },
    });
  };

  const handleHandSizeRangeChange = (newHandSizeRange: HandSizeRange) => {
    updateSettingsMutation.mutate({
      code,
      settings: { ...selectedSettings, handSizeRange: newHandSizeRange },
    });
  };

  const handleReadyChange = (nextIsReady: boolean) => {
    updateReadyMutation.mutate({
      field: 'isReady',
      code,
      isReady: nextIsReady,
    });
  };

  return (
    <LobbyView
      code={code}
      players={players}
      handSize={selectedSettings.handSize}
      handSizeRange={selectedSettings.handSizeRange}
      user={{ ...user, isReady }}
      handleNameChange={handleNameChange}
      handleReadyChange={handleReadyChange}
      handleColorChange={handleColorChange}
      handleHandSizeChange={handleHandSizeChange}
      handleHandSizeRangeChange={handleHandSizeRangeChange}
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
