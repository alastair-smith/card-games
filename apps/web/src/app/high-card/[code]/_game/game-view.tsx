'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HorizontalHand, VerticalHand } from '~/components/layout/hand';
import {
  PlayAreaPlayerName,
  PlayAreaPlayerZone,
  PlayAreaRoot,
} from '~/components/layout/play-area';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card/playing-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useSwipe } from '~/hooks/use-swipe';
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
  const [activeTab, setActiveTab] = useState('board');
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
        <PlayAreaPlayerZone key={player.id}>
          <PlayingCard card={player.card} size='sm' />
          <PlayAreaPlayerName>
            {player.name}
            {player.isUser && ' (You)'}
          </PlayAreaPlayerName>
        </PlayAreaPlayerZone>
      ))}
    </PlayAreaRoot>
  );

  const PlayerHandContent = user?.card === null && (
    <PlayingCard
      card={user?.card}
      onClick={userCanPickup ? pickupCard : undefined}
      highlighted={userCanPickup}
    />
  );

  return (
    <div className={cn('h-svh p-3', className)}>
      {winners[0] && (
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Game Summary</DialogTitle>
              <DialogDescription>
                {winners.map(({ name }) => name).join(' & ')}{' '}
                {winners.length > 1 ? 'win' : 'wins'}
                {winners[0].card?.rank
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
        </Dialog>
      )}

      {/* Mobile view with tabs */}
      <div className='flex h-full flex-col lg:hidden'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex flex-1 flex-col'
        >
          <div className='relative flex-1 overflow-hidden' {...swipeHandlers}>
            <TabsContent
              value='board'
              forceMount
              className={cn(
                'absolute inset-0 h-full w-full overflow-y-auto p-3 transition-transform duration-300 ease-in-out',
                {
                  'translate-x-0': activeTab === 'board',
                  '-translate-x-full': activeTab === 'hand',
                },
              )}
            >
              {PlayArea}
            </TabsContent>
            <TabsContent
              value='hand'
              forceMount
              className={cn(
                'absolute inset-0 h-full w-full transition-transform duration-300 ease-in-out',
                {
                  'translate-x-0': activeTab === 'hand',
                  'translate-x-full': activeTab === 'board',
                },
              )}
            >
              <VerticalHand>{PlayerHandContent}</VerticalHand>
            </TabsContent>
          </div>
          <div className='pb-[calc(env(safe-area-inset-bottom)+0.75rem)]'>
            <TabsList className='w-full'>
              <TabsTrigger value='board' className='flex-1'>
                Board
              </TabsTrigger>
              <TabsTrigger value='hand' className='flex-1'>
                Hand
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Desktop view */}
      <div className={cn('hidden h-full flex-col gap-3 lg:flex')}>
        {PlayArea}
        <HorizontalHand>{PlayerHandContent}</HorizontalHand>
      </div>
    </div>
  );
}
