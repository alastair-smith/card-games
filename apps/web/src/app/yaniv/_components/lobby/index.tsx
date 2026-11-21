'use client';

import { useMutation, useMutationState } from '@tanstack/react-query';
import { useLobbyPlayer } from '~/components/lobby/use-lobby-player';
import { toast } from '~/components/ui/toast';
import { useWaitForServerValue } from '~/hooks/use-wait-for-server-value';
import { useTRPC } from '~/trpc/react';
import type { GameCode, Player } from '~/types/game';
import {
  type Settings,
  type SettingUpdate,
  updateSettingsInputSchema,
} from '~/types/games/yaniv';
import YanivLobbyView from './lobby.view';

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
  const {
    user,
    handleNameChange,
    handleColorChange,
    handleReadyChange,
    handleLeave,
    handleKick,
    handleMakeHost,
  } = useLobbyPlayer({ code, players });

  const waitForSettingUpdate = useWaitForServerValue(
    settings,
    isSettingUpdateApplied,
  );

  const trpc = useTRPC();
  const startGameMutation = useMutation(trpc.yaniv.startGame.mutationOptions());
  const updateSettingsMutation = useMutation(
    trpc.yaniv.updateSettings.mutationOptions({
      scope: { id: `settings-${code}` },
      onSuccess: (_data, { settings: update }) => waitForSettingUpdate(update),
      onError: () => {
        toast.error('Error updating settings.');
      },
    }),
  );
  const pendingSettingsVariables = useMutationState({
    filters: {
      mutationKey: trpc.yaniv.updateSettings.mutationKey(),
      status: 'pending',
    },
    select: (mutation) => mutation.state.variables,
  });

  // Show each setting as chosen while it saves, in the order they were chosen
  const selectedSettings: Settings = { ...settings };
  for (const variables of pendingSettingsVariables) {
    const pending = updateSettingsInputSchema.safeParse(variables);
    if (pending.success && pending.data.code === code) {
      Object.assign(selectedSettings, pending.data.settings);
    }
  }

  const handleSettingChange = (update: SettingUpdate) => {
    updateSettingsMutation.mutate({ code, settings: update });
  };

  const handleStartGame = () => {
    startGameMutation.mutate({ code });
  };

  return (
    <YanivLobbyView
      code={code}
      players={players}
      settings={selectedSettings}
      user={user}
      onNameChange={handleNameChange}
      onColorChange={handleColorChange}
      onReadyChange={handleReadyChange}
      onSettingChange={handleSettingChange}
      onStartGame={handleStartGame}
      onLeave={handleLeave}
      onKick={handleKick}
      onMakeHost={handleMakeHost}
    />
  );
}
