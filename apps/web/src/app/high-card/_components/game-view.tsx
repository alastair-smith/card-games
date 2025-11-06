'use client';

import { BrainIcon, CogIcon, DrumIcon, SmilePlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { EmojiRain } from '~/components/emoji-rain/emoji-rain';
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
import { PlayingCard } from '~/components/ui/playing-card';
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
  onEmojiClick: (emoji: ReactionEmoji) => void;
  playerUserId?: UserId;
  reactions: Record<UserId, { emoji: ReactionEmoji; id: number }>;
};

export default function HighCardGameView({
  className,
  state,
  pickupCard,
  onEmojiClick,
  reactions,
}: HighCardGameProps) {
  const [activeTab, setActiveTab] = useState('board');
  const winners = useMemo(() => {
    return state.players.filter((player) =>
      state.winners.some((winningPlayerId) => winningPlayerId === player.id),
    );
  }, [state.winners, state.players]);

  const [showEmojiReactions, setShowEmojiReactions] = useState(false);

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

  const PlayArea = (
    <PlayAreaRoot className='flex-1'>
      {state.players.map((player) => (
        <EmojiRain key={player.id} reaction={reactions[player.id]}>
          <PlayAreaPlayerZone>
            <PlayingCard
              card={player.card}
              className='text-2xl'
              design='simple'
            />
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
          <span className='text-balance'>
            {currentPlayer?.name} is thinking
          </span>
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
      {/* end game dialog */}
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
            {/* mobile and desktop game board */}
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

            {/* mobile hand */}
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

          {/* notifications and reactions */}
          <div className='grid grid-cols-[2.75rem_1fr_auto_1fr_2.75rem] items-center justify-center w-full'>
            <div className='col-start-3 row-start-2'>
              {notificationsContent}
            </div>

            <div className='row-start-1 col-span-full justify-self-end lg:row-start-2 lg:col-start-4 lg:col-span-1 lg:mr-3'>
              {showEmojiReactions && (
                <EmojiReactions onEmojiClick={onEmojiClick} className='' />
              )}
            </div>

            <Button
              size='sm'
              onClick={() => setShowEmojiReactions(!showEmojiReactions)}
              className='bg-alt-background text-dark-text border-border w-fit row-start-2 col-start-5 justify-self-end my-2'
            >
              <span className='sr-only'>Open emoji reactions menu</span>
              <SmilePlusIcon />
            </Button>
          </div>
        </div>

        {/* desktop hand */}
        <div className='hidden lg:block pb-6'>
          <HorizontalHand>{PlayerHandContent}</HorizontalHand>
        </div>

        {/* mobile tab controls */}
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
      </Dialog>
    </GameLayout>
  );
}
