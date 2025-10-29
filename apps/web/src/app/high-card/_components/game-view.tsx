'use client';

import { BrainIcon, CogIcon, DrumIcon, SmilePlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EmojiRain,
  type EmojiRainRef,
} from '~/components/emoji-rain/emoji-rain';
import { EmojiReactions } from '~/components/emoji-reactions';
import GameLayout from '~/components/layout/game-layout';
import { HorizontalHand, VerticalHand } from '~/components/layout/hand';
import {
  PlayAreaPlayerName,
  PlayAreaPlayerZone,
  PlayAreaRoot,
} from '~/components/layout/play-area';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useSwipe } from '~/hooks/use-swipe';
import { RANK_FULL_NAME } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { GameType, type ReactionEmoji } from '~/types/game';
import type { GameState } from '~/types/games/high-card';
import { cn } from '~/utils/cn';
import { HowToContent } from './how-to';

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
  const [activeTab, setActiveTab] = useState('board');
  const winners = useMemo(() => {
    return state.players.filter((player) =>
      state.winners.some((winningPlayerId) => winningPlayerId === player.id),
    );
  }, [state.winners, state.players]);

  const [showEmojiReactions, setShowEmojiReactions] = useState(false);

  const handleEmojiClick = (emoji: ReactionEmoji, targetPlayerId: UserId) => {
    emojiRainRefs.current[targetPlayerId]?.triggerEmoji(emoji);
  };

  const [showWinnerDialog, setShowWinnerDialog] = useState(!!winners[0]);
  useEffect(() => {
    setShowWinnerDialog(!!winners[0]);
  }, [winners]);

  const userIndex = state.players.findIndex((player) => player.isUser);
  // biome-ignore lint/style/noNonNullAssertion: element exists as index is fetched just before
  const user = state.players[userIndex]!;
  const userCanPickup =
    (userIndex === 0 || !!state.players[userIndex - 1]?.card) && !user.card;

  const currentPlayer = state.players.find(({ card }) => !card);

  const handleSwipeLeft = () => {
    if (activeTab === 'board') {
      setActiveTab('hand');
    }
  };

  const handleSwipeRight = () => {
    if (activeTab === 'hand') {
      setActiveTab('board');
    }
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
  });

  const emojiRainRefs = useRef<Record<string, EmojiRainRef | null>>({});

  const PlayArea = (
    <PlayAreaRoot className='flex-1'>
      {state.players.map((player) => (
        <EmojiRain
          ref={(el) => {
            emojiRainRefs.current[player.id] = el;
          }}
          key={player.id}
        >
          <PlayAreaPlayerZone>
            <PlayingCard card={player.card} size='sm' />
            <PlayAreaPlayerName>
              {player.name}
              {player.isUser && ' (You)'}
            </PlayAreaPlayerName>
          </PlayAreaPlayerZone>
        </EmojiRain>
      ))}
    </PlayAreaRoot>
  );

  const PlayerHandContent = user?.card === null && (
    <PlayingCard
      card={user?.card}
      onClick={
        userCanPickup
          ? () => {
              pickupCard();
              setActiveTab('board');
            }
          : undefined
      }
      highlighted={userCanPickup}
    />
  );

  const gameActions = (
    <div className='flex gap-2'>
      <Dialog>
        <DialogTrigger asChild>
          <Button size='sm' variant='secondary'>
            Help
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to play High Card</DialogTitle>
            <DialogDescription asChild>
              <HowToContent />
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );

  const notificationsContent = (
    <>
      {winners[0] ? (
        <DialogTrigger asChild>
          <Button size='sm'>View End Screen</Button>
        </DialogTrigger>
      ) : userCanPickup ? (
        <div className='animate-bounce flex gap-2 justify-center'>
          <span>It's your turn!</span>
          <div className='flex'>
            <DrumIcon />
          </div>
        </div>
      ) : (
        <div className='flex gap-1.5 justify-center items-center'>
          <span>{currentPlayer?.name} is thinking</span>
          <div className='flex'>
            <CogIcon className='animate-spin' />
            <BrainIcon className='animate-pulse' />
            <CogIcon className='animate-spin' />
          </div>
        </div>
      )}
    </>
  );

  return (
    <GameLayout
      gameType={GameType.HIGH_CARD}
      actions={gameActions}
      className={className}
    >
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Summary</DialogTitle>
            <DialogDescription>
              {winners.map(({ name }) => name).join(' & ')}{' '}
              {winners.length > 1 ? 'win' : 'wins'}
              {winners[0]?.card?.rank
                ? ` with a ${RANK_FULL_NAME[winners[0].card?.rank]}!`
                : '!'}
            </DialogDescription>
            <DialogFooter>
              <Button asChild>
                <Link href='/'>Pick Another Game</Link>
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>

        <div className='flex-grow flex h-full flex-col'>
          <div className='relative flex-1 overflow-hidden' {...swipeHandlers}>
            <div
              className={cn(
                'p-3 lg:p-0 h-full',
                'absolute inset-0 w-full overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:transition-none',
                {
                  'translate-x-0': activeTab === 'board',
                  '-translate-x-full': activeTab === 'hand',
                },
              )}
            >
              {PlayArea}
            </div>

            <div
              className={cn(
                'absolute inset-0 h-full w-full transition-transform duration-300 ease-in-out lg:hidden',
                {
                  'translate-x-0': activeTab === 'hand',
                  'translate-x-full': activeTab === 'board',
                },
              )}
            >
              <VerticalHand>{PlayerHandContent}</VerticalHand>
            </div>
          </div>

          <div className='flex flex-col items-center gap-2 lg:grid lg:grid-cols-3 lg:gap-6 w-full lg:my-3'>
            <div className='w-full flex justify-end lg:hidden'>
              {showEmojiReactions && user?.id && (
                <EmojiReactions
                  onEmojiClick={handleEmojiClick}
                  targetPlayerId={user.id}
                />
              )}
            </div>

            <div className='w-full grid grid-cols-8 gap-2 pb-2 lg:pb-0 items-center lg:col-start-2 lg:w-auto lg:justify-self-center'>
              <div className='col-start-2 col-span-6 justify-self-center'>
                {notificationsContent}
              </div>
              <div className='col-start-8 justify-self-end lg:hidden'>
                <Button
                  size='sm'
                  onClick={() => setShowEmojiReactions(!showEmojiReactions)}
                  className='bg-switch text-dark-text border-border w-fit'
                >
                  <span className='sr-only'>Open emoji reactions menu</span>
                  <SmilePlusIcon />
                </Button>
              </div>
            </div>

            <div className='hidden lg:flex col-start-3 justify-self-end gap-3 items-center'>
              {showEmojiReactions && user?.id && (
                <EmojiReactions
                  onEmojiClick={handleEmojiClick}
                  targetPlayerId={user.id}
                />
              )}
              <Button
                size='sm'
                onClick={() => setShowEmojiReactions(!showEmojiReactions)}
                className='bg-switch text-dark-text border-border w-fit'
              >
                <SmilePlusIcon />
              </Button>
            </div>
          </div>

          <div className='hidden lg:block pb-6'>
            <HorizontalHand>{PlayerHandContent}</HorizontalHand>
          </div>

          <div className='pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='w-full'>
                <TabsTrigger value='board' className='flex-1'>
                  Board
                </TabsTrigger>
                <TabsTrigger value='hand' className='flex-1'>
                  Hand
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Dialog>
    </GameLayout>
  );
}
