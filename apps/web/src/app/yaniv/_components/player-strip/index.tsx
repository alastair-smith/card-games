import type { ComponentProps } from 'react';
import type { UserId } from '~/types/entities';
import type { GameStep } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import { PlayerTag } from '../player-tag';
import { TurnStatus } from '../turn-status';

type PlayerStripProps = {
  className?: string;
  players: (Pick<
    ComponentProps<typeof PlayerTag>,
    'name' | 'color' | 'cardCount' | 'isYanivCalled' | 'emojiReaction'
  > & {
    id: UserId;
    isPlayersTurn?: boolean | undefined;
  })[];
  userId: UserId;
  step: GameStep;
};

/** Every player's tag, under a line saying what's happening. */
export function PlayerStrip({
  className,
  players,
  userId,
  step,
}: PlayerStripProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <TurnStatus players={players} userId={userId} step={step} />
      <ol
        aria-label='Players'
        // Wide enough that a Yaniv sticker, which overhangs its tag, stays
        // clear of the turn brackets around the next one
        className='m-0 flex list-none flex-wrap justify-evenly gap-x-6 gap-y-5 p-1.5 lg:justify-center'
      >
        {players.map((player) => (
          <li
            key={player.id}
            aria-current={player.isPlayersTurn ? 'step' : undefined}
          >
            <PlayerTag
              name={player.name}
              color={player.color}
              cardCount={player.cardCount}
              isUser={player.id === userId}
              isPlayersTurn={!!player.isPlayersTurn}
              isYanivCalled={player.isYanivCalled}
              emojiReaction={player.emojiReaction}
            />
            {player.isPlayersTurn && (
              <span className='sr-only'>, their turn</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
