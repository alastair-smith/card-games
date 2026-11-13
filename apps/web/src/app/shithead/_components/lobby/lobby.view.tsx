'use client';

import LobbyView, {
  type GameLobbyViewProps,
} from '~/components/lobby/lobby-view';
import { GameType } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/shithead';

export default function ShitheadLobbyView(props: GameLobbyViewProps) {
  return (
    <LobbyView
      gameType={GameType.SHITHEAD}
      minPlayers={MIN_PLAYERS}
      maxPlayers={MAX_PLAYERS}
      {...props}
    />
  );
}
