'use client';

import { useMemo } from 'react';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import type { Player } from '~/server/data/high-card';
import { RANK_FULL_NAME } from '~/types/cards';
import type { UserId } from '~/types/entities';
import type { GameState } from '~/types/games/high-card';

export type HighCardGameProps = {
  state: GameState;
  pickupCard: () => void;
  playerUserId?: UserId;
};

export default function HighCardGameView({
  state,
  pickupCard,
}: HighCardGameProps) {
  const winners = useMemo(() => {
    return state.players.filter((player) =>
      state.winners.some((winningPlayerId) => winningPlayerId === player.id),
    );
  }, [state.winners, state.players]);

  return (
    <div className='flex flex-col gap-4 text-white items-start'>
      {state.players.map((player, index) => {
        const canPickup =
          player.isUser &&
          !player.card &&
          !!(index === 0 || state.players[index - 1]?.card);

        return (
          <div key={player.id} className='flex flex-col gap-2 p-4'>
            <div>
              {player.name}
              {player.isUser && ' (You)'}
            </div>
            <div>
              <PlayingCard
                card={player.card}
                onClick={canPickup ? pickupCard : undefined}
                highlighted={canPickup}
              />
              {canPickup && <div>Your go</div>}
            </div>
          </div>
        );
      })}
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
