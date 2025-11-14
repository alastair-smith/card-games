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
  SharedZone,
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
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useSwipe } from '~/hooks/use-swipe';
import { Rank, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { GameType, type ReactionEmoji } from '~/types/game';
import type { GameState } from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
// import { HowToContent } from './how-to';

export type YanivGameProps = {
  className?: string;
  state: GameState;
  pickupCard: () => void;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  playerUserId?: UserId;
  reactions: Record<UserId, { emoji: ReactionEmoji; id: number }>;
};

export default function YanivGameView({
  className,
  state,
  pickupCard,
  onEmojiClick,
  reactions,
}: YanivGameProps) {
  const [activeTab, setActiveTab] = useState('board');
  const loser = useMemo(() => {
    return state.players.find((player) => state.loser === player.id);
  }, [state.loser, state.players]);

  const [showEmojiReactions, setShowEmojiReactions] = useState(false);

  const [showEndGameDialog, setShowEndGameDialog] = useState(!!loser);
  useEffect(() => {
    setShowEndGameDialog(!!loser);
  }, [loser]);

  const userIndex = state.players.findIndex((player) => player.isUser);
  // biome-ignore lint/style/noNonNullAssertion: element exists as index is fetched just before
  const user = state.players[userIndex]!;

  const handleSwipeLeft = () => {
    if (activeTab === 'players') {
      setActiveTab('hand');
    }
  };

  const handleSwipeRight = () => {
    if (activeTab === 'hand') {
      setActiveTab('players');
    }
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
  });

  /**
   * Show deck for other players with a number on it for a tighter stack?
   * Reveal other players remaining cards at end of game? Maybe the deck wouldn't work for that, so just smaller cards would be better
   * Cap a null stack size?
   * worth displaying the number of cards regardless





   */

  const PlayArea = (
    <PlayAreaRoot className='flex-1'>
      <SharedZone>
        <div className='grid grid-cols-2 w-fit text-2xl gap-2'>
          <PlayingCardDeck />
          <PlayingCardDiscardPile>
            {state.discard && <PlayingCard card={state.discard} border />}
          </PlayingCardDiscardPile>
          <PlayingCardStack className='col-span-2'>
            {state.currentPlayer.playedCards.map((card) => (
              <PlayingCard
                key={`${card.suit}-${card.rank}`}
                card={card}
                border
              />
            ))}
          </PlayingCardStack>
        </div>
      </SharedZone>

      {state.players.map((player) => (
        <PlayAreaPlayerZone key={player.id}>
          <EmojiRain
            reaction={reactions[player.id]}
            className='flex flex-col items-center gap-1 w-full text-2xl'
          >
            {player.isUser ? (
              <PlayingCardStack>
                {state.userHand.map((card) => (
                  <PlayingCard
                    key={`${card.suit}-${card.rank}`}
                    card={card}
                    border
                  />
                ))}
              </PlayingCardStack>
            ) : (
              <PlayingCardStack>
                {Array.from({ length: player.handSize }, (_, index) => (
                  <PlayingCard key={index} card={null} border />
                ))}
              </PlayingCardStack>
            )}

            <PlayAreaPlayerName>
              {player.name}
              {player.isUser && ' (You)'}
            </PlayAreaPlayerName>
          </EmojiRain>
        </PlayAreaPlayerZone>
      ))}
    </PlayAreaRoot>
  );

  const PlayerHandContent = state.userHand.map((card) => (
    <PlayingCard key={`${card.suit}-${card.rank}`} card={card} />
  ));

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
            <DialogTitle>How to play Yaniv</DialogTitle>
            <DialogDescription asChild>
              {/*<HowToContent />*/}
              TODO
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
      {loser ? (
        <DialogTrigger asChild>
          <Button size='sm'>View End Screen</Button>
        </DialogTrigger>
      ) : state.currentPlayer.isUser ? (
        <div className='animate-bounce flex gap-2 justify-center'>
          <span>It's your turn!</span>
          <div className='flex'>
            <DrumIcon />
          </div>
        </div>
      ) : (
        <div className='flex gap-1.5 justify-center items-center'>
          <span className='text-balance'>
            {state.currentPlayer.name} is thinking
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
      gameType={GameType.YANIV}
      actions={gameActions}
      className={className}
    >
      {/* end game dialog */}
      <Dialog open={showEndGameDialog} onOpenChange={setShowEndGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Summary</DialogTitle>
            <DialogDescription>{loser?.name} loses</DialogDescription>
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
                  'translate-x-0': activeTab === 'players',
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
                  'translate-x-full': activeTab === 'players',
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
              <TabsTrigger value='players' className='flex-1'>
                Players
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
