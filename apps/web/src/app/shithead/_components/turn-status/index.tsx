import { BrainIcon } from 'lucide-react';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStage, type TableCardSlot } from '~/types/games/shithead';
import { cn } from '~/utils/cn';
import { getPlaySource, type PlaySource } from '~/utils/shithead/play-source';

const USER_TURN_TEXT = {
  hand: 'Your turn: play from your hand',
  faceUp: 'Your turn: play a face-up card',
  faceDown: 'Your turn: turn over a face-down card',
} as const satisfies Record<PlaySource, string>;

const OTHER_PLAYER_TURN_TEXT = {
  hand: (name: PlayerName) => `${name} is playing from their hand`,
  faceUp: (name: PlayerName) => `${name} is playing a face-up card`,
  faceDown: (name: PlayerName) => `${name} is turning over a face-down card`,
} as const satisfies Record<PlaySource, (name: PlayerName) => string>;

type TurnStatusProps = {
  className?: string;
  gameStage: GameStage.SWAPPING | GameStage.IN_PROGRESS;
  players: {
    id: UserId;
    name: PlayerName;
    isUser: boolean;
    isPlayersTurn: boolean;
    isSwapConfirmed: boolean;
    cardCount: number;
    tableCards: TableCardSlot[];
  }[];
};

function getSwappingStatus(players: TurnStatusProps['players']) {
  const user = players.find((player) => player.isUser);
  if (!user?.isSwapConfirmed) {
    return { turnText: 'Swap your cards, then confirm', isUserActing: true };
  }

  const playersSwapping = players.filter((player) => !player.isSwapConfirmed);
  const [firstPlayerSwapping] = playersSwapping;
  if (!firstPlayerSwapping) return null;
  return {
    turnText:
      playersSwapping.length === 1
        ? `Waiting for ${firstPlayerSwapping.name} to finish swapping`
        : `Waiting for ${playersSwapping.length} players to finish swapping`,
    isUserActing: false,
  };
}

function getTurnStatus({
  gameStage,
  players,
}: Omit<TurnStatusProps, 'className'>) {
  if (gameStage === GameStage.SWAPPING) return getSwappingStatus(players);

  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  if (!playerTakingTurn) return null;
  const playSource = getPlaySource(playerTakingTurn);
  if (!playSource) return null;

  return playerTakingTurn.isUser
    ? { turnText: USER_TURN_TEXT[playSource], isUserActing: true }
    : {
        turnText: OTHER_PLAYER_TURN_TEXT[playSource](playerTakingTurn.name),
        isUserActing: false,
      };
}

/**
 * Says whose turn it is and what they need to do. Screen readers hear it from
 * TurnAnnouncement instead, which stays reachable when this sits in a tab
 * that's out of view.
 */
export function TurnStatus({ className, ...props }: TurnStatusProps) {
  const status = getTurnStatus(props);

  return (
    <div
      aria-hidden='true'
      // Keeps a line's height with no status, so the table doesn't shift
      className={cn(
        'flex min-h-6 flex-wrap items-center justify-center gap-x-2 text-center font-semibold text-balance',
        className,
      )}
    >
      {status?.turnText}
      {status && !status.isUserActing && (
        <BrainIcon size={20} className='motion-safe:animate-pulse' />
      )}
    </div>
  );
}

/** Announces the turn status to screen readers as it changes. */
export function TurnAnnouncement(props: Omit<TurnStatusProps, 'className'>) {
  const status = getTurnStatus(props);

  return (
    <div role='status' aria-live='polite' className='sr-only'>
      {status?.turnText}
    </div>
  );
}
