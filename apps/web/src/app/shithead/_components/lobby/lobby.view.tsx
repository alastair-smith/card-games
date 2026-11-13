'use client';

import LobbyView, { type LobbyViewProps } from '~/components/lobby/lobby-view';
import { GameType } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/shithead';

export type ShitheadLobbyViewProps = Omit<
  LobbyViewProps,
  'gameType' | 'minPlayers' | 'maxPlayers' | 'actions' | 'children'
>;

export default function ShitheadLobbyView(props: ShitheadLobbyViewProps) {
  return (
    <LobbyView
      gameType={GameType.SHITHEAD}
      minPlayers={MIN_PLAYERS}
      maxPlayers={MAX_PLAYERS}
      {...props}
    />
  );
}
