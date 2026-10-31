import { BrainIcon, MegaphoneIcon } from 'lucide-react';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep, type PickupSource } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';

const USER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: 'Your turn: choose what to play',
  [GameStep.PICKUP_CARD]: 'Pick up from the deck or discard pile',
  [GameStep.PROCEED]: 'Call Yaniv or end your turn',
  [GameStep.REDEAL]: 'Deal the next round',
} as const satisfies Record<GameStep, string>;

const OTHER_PLAYER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: (name: PlayerName) => `${name} is choosing cards`,
  [GameStep.PICKUP_CARD]: (name: PlayerName) => `${name} is picking up`,
  [GameStep.PROCEED]: (name: PlayerName, pickupSource: PickupSource | null) =>
    pickupSource
      ? `${name} has drawn from the ${pickupSource}`
      : `${name} matched the discard`,
  [GameStep.REDEAL]: (name: PlayerName) => `${name} to deal`,
} as const satisfies Record<
  GameStep,
  (name: PlayerName, pickupSource: PickupSource | null) => string
>;

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
  pickupSource: PickupSource | null;
};

function getTurnStatus({
  players,
  userId,
  step,
  pickupSource,
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
      : OTHER_PLAYER_TURN_TEXT[step](playerTakingTurn.name, pickupSource),
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
      {status.yanivText ? (
        <span className='flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-dark-text-disabled'>
          <MegaphoneIcon size={12} />
          {status.yanivText}
        </span>
      ) : (
        // Keeps the Yaniv line's space, so the table doesn't shift when it
        // appears
        <span className='text-xs'>&nbsp;</span>
      )}
      <span className='flex flex-wrap items-center justify-center gap-x-2 font-semibold text-balance'>
        {status.turnText}
        {!status.isUserTakingTurn && (
          <BrainIcon size={20} className='motion-safe:animate-pulse' />
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
