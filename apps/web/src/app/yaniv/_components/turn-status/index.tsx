import { BrainIcon, CogIcon, MegaphoneIcon } from 'lucide-react';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

const USER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: 'Your turn: choose what to play',
  [GameStep.PICKUP_CARD]: 'Pick up from the deck or discard pile',
  [GameStep.PROCEED]: 'Call Yaniv or end your turn',
  [GameStep.REDEAL]: 'Deal the next round',
} as const satisfies Record<GameStep, string>;

const OTHER_PLAYER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: (name: PlayerName) =>
    `${name} is choosing what to play`,
  [GameStep.PICKUP_CARD]: (name: PlayerName) => `${name} needs to pick up`,
  [GameStep.PROCEED]: (name: PlayerName) =>
    `${name} is deciding whether to call Yaniv`,
  [GameStep.REDEAL]: (name: PlayerName) => `Waiting for ${name} to deal`,
} as const satisfies Record<GameStep, (name: PlayerName) => string>;

type TurnStatusProps = {
  className?: string;
  players: {
    id: UserId;
    name: PlayerName;
    isYanivCalled: boolean;
    isPlayersTurn?: boolean | undefined;
  }[];
  userId: UserId;
  step: GameStep;
};

function getTurnStatus({
  players,
  userId,
  step,
}: Omit<TurnStatusProps, 'className'>) {
  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  if (!playerTakingTurn) return null;

  // Everyone else gets a last turn after a Yaniv call, until the round ends
  const yanivCaller =
    step === GameStep.REDEAL
      ? undefined
      : players.find((player) => player.isYanivCalled);
  const isUserTakingTurn = playerTakingTurn.id === userId;

  return {
    isUserTakingTurn,
    yanivText:
      yanivCaller &&
      `${yanivCaller.id === userId ? 'You' : yanivCaller.name} called Yaniv! Last turns`,
    turnText: isUserTakingTurn
      ? USER_TURN_TEXT[step]
      : OTHER_PLAYER_TURN_TEXT[step](playerTakingTurn.name),
  };
}

/**
 * Says what's happening: whose turn it is and what they need to do. Screen
 * readers hear it from TurnAnnouncement instead, which stays reachable when
 * this sits in a tab that's out of view.
 */
export function TurnStatus({ className, ...props }: TurnStatusProps) {
  const status = getTurnStatus(props);
  if (!status) return null;

  return (
    <div
      aria-hidden='true'
      className={cn('flex flex-col items-center text-center', className)}
    >
      {status.yanivText && (
        <span className='flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-dark-text-disabled'>
          <MegaphoneIcon size={12} />
          {status.yanivText}
        </span>
      )}
      <span className='flex flex-wrap items-center justify-center gap-x-2 font-semibold text-balance'>
        {status.turnText}
        {!status.isUserTakingTurn && (
          <span className='flex'>
            <CogIcon size={20} className='motion-safe:animate-spin' />
            <BrainIcon size={20} className='motion-safe:animate-pulse' />
            <CogIcon size={20} className='motion-safe:animate-spin' />
          </span>
        )}
      </span>
    </div>
  );
}

/** Announces the turn status to screen readers as it changes. */
export function TurnAnnouncement(props: Omit<TurnStatusProps, 'className'>) {
  const status = getTurnStatus(props);

  return (
    <div role='status' aria-live='polite' className='sr-only'>
      {status?.yanivText && `${status.yanivText}. `}
      {status?.turnText}
    </div>
  );
}
