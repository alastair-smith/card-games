'use client';

import { useMemo } from 'react';
import { Hand } from '~/components/layout/hand';
import {
  PlayAreaPlayerName,
  PlayAreaPlayerZone,
  PlayAreaRoot,
} from '~/components/layout/play-area';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import type { Player } from '~/server/data/high-card';
import { RANK_FULL_NAME } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameState } from '~/types/games/high-card';
import { cn } from '~/utils/cn';

export type HighCardGameProps = {
  className?: string;
  state: GameState;
  pickupCard: () => void;
  playerUserId?: UserId;
};

export default function HighCardGameView({
  className,
  state,
  pickupCard,
}: HighCardGameProps) {
  const winners = useMemo(() => {
    return state.players.filter((player) =>
      state.winners.some((winningPlayerId) => winningPlayerId === player.id),
    );
  }, [state.winners, state.players]);

  const userIndex = state.players.findIndex((player) => player.isUser);
  // biome-ignore lint/style/noNonNullAssertion: element exists as index is fetched just before
  const user = state.players[userIndex]!;
  const userCanPickup =
    (userIndex === 0 || !!state.players[userIndex - 1]?.card) && !user.card;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <PlayAreaRoot className='flex-1'>
        {state.players.map((player) => {
          return (
            <PlayAreaPlayerZone key={player.id}>
              <PlayingCard card={player.card} size='sm' />
              <PlayAreaPlayerName>
                {player.name}
                {player.isUser && ' (You)'}
              </PlayAreaPlayerName>
            </PlayAreaPlayerZone>
          );
        })}
      </PlayAreaRoot>
      <Hand>
        {user?.card === null && (
          <PlayingCard
            card={user?.card}
            onClick={userCanPickup ? pickupCard : undefined}
            highlighted={userCanPickup}
          />
        )}
      </Hand>
      {winners.length && <Winner players={winners} />}
    </div>
  );
}

function Winner({ players }: { players: Player[] }) {
  if (!players[0]) return null;

  return (
    <div className='text-3xl text-green-500'>
      {players.map(({ name }) => name).join(' & ')}
      {players.length > 1 ? ' win' : ' wins'}
      {players[0].card && ` with a ${RANK_FULL_NAME[players[0].card.rank]}`}!
    </div>
  );
}
