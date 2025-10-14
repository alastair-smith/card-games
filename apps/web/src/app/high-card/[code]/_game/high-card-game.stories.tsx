import { useState } from 'react';
import { toast } from '~/components/ui/toast';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import type { UserId } from '~/types/entities';
import { GameStage } from '~/types/games/high-card';
import Game from './game-view';

export const Turn1 = () => {
  return (
    <Game
      className='min-h-screen'
      pickupCard={() => {
        toast.success('Card picked up!');
      }}
      state={{
        players: [
          { id: '1' as UserId, name: 'Alice', isUser: false, card: null },
          { id: '2' as UserId, name: 'Bob', isUser: true, card: null },
          { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
        ],
        winners: [],
        stage: GameStage.IN_PROGRESS,
      }}
    />
  );
};

export const Turn2 = () => {
  const [card2, setCard2] = useState<StandardPlayingCard | null>(null);
  return (
    <Game
      className='min-h-screen'
      pickupCard={() => {
        setCard2({ suit: Suit.SPADES, rank: Rank.QUEEN });
        toast.success('Card picked up!');
      }}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alice',
            isUser: false,
            card: { suit: Suit.HEARTS, rank: Rank.THREE },
          },
          { id: '2' as UserId, name: 'Bob', isUser: true, card: card2 },
          { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
        ],
        winners: [],
        stage: GameStage.IN_PROGRESS,
      }}
    />
  );
};

export const Turn3 = () => {
  return (
    <Game
      className='min-h-screen'
      pickupCard={() => {
        toast.success('Card picked up!');
      }}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alice',
            isUser: false,
            card: { suit: Suit.HEARTS, rank: Rank.THREE },
          },
          {
            id: '2' as UserId,
            name: 'Bob',
            isUser: true,
            card: { suit: Suit.SPADES, rank: Rank.QUEEN },
          },
          { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
        ],
        winners: [],
        stage: GameStage.IN_PROGRESS,
      }}
    />
  );
};

export const Turn4 = () => {
  return (
    <Game
      className='min-h-screen'
      pickupCard={() => {
        toast.success('Card picked up!');
      }}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alice',
            isUser: false,
            card: { suit: Suit.HEARTS, rank: Rank.THREE },
          },
          {
            id: '2' as UserId,
            name: 'Bob',
            isUser: true,
            card: { suit: Suit.SPADES, rank: Rank.QUEEN },
          },
          {
            id: '3' as UserId,
            name: 'Zoe',
            isUser: false,
            card: { suit: Suit.CLUBS, rank: Rank.TEN },
          },
        ],
        winners: ['2'] as UserId[],
        stage: GameStage.FINISHED,
      }}
    />
  );
};

export const MaxPlayers = () => {
  return (
    <Game
      className='min-h-screen'
      pickupCard={() => {
        toast.success('Card picked up!');
      }}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alice',
            isUser: false,
            card: { suit: Suit.HEARTS, rank: Rank.THREE },
          },
          {
            id: '2' as UserId,
            name: 'Bob',
            isUser: true,
            card: { suit: Suit.SPADES, rank: Rank.QUEEN },
          },
          {
            id: '3' as UserId,
            name: 'Carl',
            isUser: false,
            card: { suit: Suit.CLUBS, rank: Rank.TEN },
          },
          {
            id: '4' as UserId,
            name: 'Denise',
            isUser: false,
            card: { suit: Suit.HEARTS, rank: Rank.TEN },
          },
          {
            id: '5' as UserId,
            name: 'Ella',
            isUser: false,
            card: { suit: Suit.SPADES, rank: Rank.FOUR },
          },
          {
            id: '6' as UserId,
            name: 'Freddie',
            isUser: false,
            card: { suit: Suit.CLUBS, rank: Rank.THREE },
          },
          {
            id: '7' as UserId,
            name: 'Georgina',
            isUser: false,
            card: { suit: Suit.CLUBS, rank: Rank.SEVEN },
          },
          {
            id: '8' as UserId,
            name: 'Henry',
            isUser: false,
            card: { suit: Suit.SPADES, rank: Rank.JACK },
          },
          {
            id: '9' as UserId,
            name: 'Ian',
            isUser: false,
            card: { suit: Suit.DIAMONDS, rank: Rank.ACE },
          },
          {
            id: '10' as UserId,
            name: 'John',
            isUser: false,
            card: { suit: Suit.CLUBS, rank: Rank.NINE },
          },
        ],
        winners: [],
        stage: GameStage.IN_PROGRESS,
      }}
    />
  );
};
