'use client';

import { useMutationState } from '@tanstack/react-query';
import { getMutationKey } from '@trpc/react-query';
import debounce from 'lodash/debounce';
import { useCallback, useRef, useState } from 'react';
import { toast } from '~/components/ui/toast';
import { useWaitForServerValue } from '~/hooks/use-wait-for-server-value';
import { api } from '~/trpc/react';
import { MIN_NAME_LENGTH, type UserId } from '~/types/entities';
import type { GameCode, Player } from '~/types/game';
import {
  type Settings,
  type SettingUpdate,
  updateSettingsInputSchema,
} from '~/types/games/yaniv';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';
import LobbyView from './lobby.view';

const PLAYER_NAME_UPDATE_DELAY_MS = 800;
const PLAYER_COLOR_UPDATE_DELAY_MS = 300;

const isSettingUpdateApplied = (settings: Settings, update: SettingUpdate) => {
  const currentSettings = new Map(Object.entries(settings));
  return Object.entries(update).every(
    ([key, value]) => currentSettings.get(key) === value,
  );
};

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
  const waitForSettingUpdate = useWaitForServerValue(
    settings,
    isSettingUpdateApplied,
  );

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
  const startGameMutation = api.yaniv.startGame.useMutation();
  const updateSettingsMutation = api.yaniv.updateSettings.useMutation({
    scope: { id: `settings-${code}` },
    onSuccess: (_data, { settings: update }) => waitForSettingUpdate(update),
    onError: () => {
      toast.error('Error updating settings.');
    },
  });
  const pendingSettingsVariables = useMutationState({
    filters: {
      mutationKey: getMutationKey(api.yaniv.updateSettings),
      status: 'pending',
    },
    select: (mutation) => mutation.state.variables,
  });

  const readyUpdate = updateReadyMutation.variables;
  const pendingIsReady =
    updateReadyMutation.isPending && readyUpdate?.field === 'isReady'
      ? readyUpdate.isReady
      : undefined;
  const isReady = pendingIsReady ?? currentPlayer.isReady;

  // Show each setting as chosen while it saves, in the order they were chosen
  const selectedSettings: Settings = { ...settings };
  for (const variables of pendingSettingsVariables) {
    const pending = updateSettingsInputSchema.safeParse(variables);
    if (pending.success && pending.data.code === code) {
      Object.assign(selectedSettings, pending.data.settings);
    }
  }

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

  const handleSettingChange = (update: SettingUpdate) => {
    updateSettingsMutation.mutate({ code, settings: update });
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
      settings={selectedSettings}
      user={{ ...user, isReady }}
      handleNameChange={handleNameChange}
      handleReadyChange={handleReadyChange}
      handleColorChange={handleColorChange}
      handleSettingChange={handleSettingChange}
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
