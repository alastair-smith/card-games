import { action } from '@ladle/react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { PlayingCard } from '~/components/ui/playing-card';
import {
  PlayingCardDeck,
  PlayingCardDiscardPile,
  PlayingCardStack,
} from '~/components/ui/playing-card-stacks';
import {
  JOKER_RANK,
  JokerSuit,
  type PlayingCardValue,
  Rank,
  Suit,
} from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStage, PlayerStep } from '~/types/games/yaniv';
import YanivGameView from './game-view';

const playAreaCards = [
  <PlayingCard key='1' card={{ suit: Suit.HEARTS, rank: Rank.TEN }} border />,
  <>
    <PlayingCard card={{ suit: Suit.DIAMONDS, rank: Rank.SEVEN }} border />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.FOUR }} border />
  </>,
  <>
    <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.THREE }} border />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.ACE }} border />
    <PlayingCard card={{ suit: Suit.SPADES, rank: Rank.JACK }} border />
  </>,
  <>
    <PlayingCard card={{ suit: Suit.CLUBS, rank: Rank.EIGHT }} border />
    <PlayingCard card={{ suit: Suit.HEARTS, rank: Rank.TEN }} border />
  </>,
];

export function PlayArea() {
  const [discardCard, setDiscardCard] = useState<PlayingCardValue | null>(null);
  const [playAreaCardsIndex, setPlayAreaCardsIndex] = useState(0);
  const [playAreaCardsVisible, setPlayAreaCardsVisible] = useState(false);

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid grid-cols-2 w-fit'>
        <PlayingCardDeck />
        <PlayingCardDiscardPile>
          {discardCard && <PlayingCard card={discardCard} border />}
        </PlayingCardDiscardPile>
        <PlayingCardStack className='col-span-2'>
          {playAreaCardsVisible && playAreaCards[playAreaCardsIndex]}
        </PlayingCardStack>
      </div>

      <div>
        <Button onClick={() => setDiscardCard(null)}>Empty Discard</Button>
        <Button
          onClick={() => {
            setPlayAreaCardsIndex(
              (playAreaCardsIndex + 1) % playAreaCards.length,
            );
            setPlayAreaCardsVisible(true);
          }}
        >
          Play cards
        </Button>
        <Button
          onClick={() => {
            setDiscardCard({ suit: Suit.CLUBS, rank: Rank.EIGHT });
            setPlayAreaCardsVisible(false);
          }}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}

export const Step1Deal = () => {
  return (
    <YanivGameView
      onEmojiClick={action('onEmojiClick')}
      gameActions={{
        declareYaniv: action('declareYaniv'),
        endTurn: action('endTurn'),
        pickupFromDeck: action('pickupFromDeck'),
        pickupFromDiscard: action('pickupFromDiscard'),
        deal: action('deal'),
      }}
      reactions={{}}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alvin' as PlayerName,
            scoreHistory: [0],
            handSize: 0,
            isUser: false,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
          {
            id: '2' as UserId,
            name: 'Barney' as PlayerName,
            scoreHistory: [0],
            handSize: 0,
            isUser: true,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
        ],
        discard: {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        },
        userHand: [],
        currentPlayer: {
          id: '2' as UserId,
          step: PlayerStep.DEAL,
          playedCards: [],
          name: 'Jerry' as PlayerName,
          isUser: true,
        },
        stage: GameStage.IN_PROGRESS,
        loser: null,
      }}
    />
  );
};

export const Step2PlayCards = () => {
  return (
    <YanivGameView
      onEmojiClick={action('onEmojiClick')}
      gameActions={{
        declareYaniv: action('declareYaniv'),
        endTurn: action('endTurn'),
        pickupFromDeck: action('pickupFromDeck'),
        pickupFromDiscard: action('pickupFromDiscard'),
        deal: action('deal'),
      }}
      reactions={{}}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alvin' as PlayerName,
            scoreHistory: [0],
            handSize: 7,
            isUser: false,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
          {
            id: '2' as UserId,
            name: 'Barney' as PlayerName,
            scoreHistory: [0],
            handSize: 2,
            isUser: true,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
        ],
        discard: {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        },
        userHand: [
          {
            suit: Suit.CLUBS,
            rank: Rank.ACE,
          },
          {
            suit: Suit.HEARTS,
            rank: Rank.ACE,
          },
        ],
        currentPlayer: {
          id: '2' as UserId,
          step: PlayerStep.PLAY_CARDS,
          playedCards: [
            {
              suit: Suit.HEARTS,
              rank: Rank.FOUR,
            },
            {
              suit: Suit.DIAMONDS,
              rank: Rank.TEN,
            },
          ],
          name: 'Jerry' as PlayerName,
          isUser: true,
        },
        stage: GameStage.IN_PROGRESS,
        loser: null,
      }}
    />
  );
};

export const Step3PickupCard = () => {
  return (
    <YanivGameView
      onEmojiClick={action('onEmojiClick')}
      gameActions={{
        declareYaniv: action('declareYaniv'),
        endTurn: action('endTurn'),
        pickupFromDeck: action('pickupFromDeck'),
        pickupFromDiscard: action('pickupFromDiscard'),
        deal: action('deal'),
      }}
      reactions={{}}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alvin' as PlayerName,
            scoreHistory: [0],
            handSize: 7,
            isUser: false,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
          {
            id: '2' as UserId,
            name: 'Barney' as PlayerName,
            scoreHistory: [0],
            handSize: 2,
            isUser: true,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
        ],
        discard: {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        },
        userHand: [
          {
            suit: Suit.CLUBS,
            rank: Rank.ACE,
          },
          {
            suit: Suit.HEARTS,
            rank: Rank.ACE,
          },
        ],
        currentPlayer: {
          id: '2' as UserId,
          step: PlayerStep.PICKUP_CARD,
          playedCards: [
            {
              suit: Suit.HEARTS,
              rank: Rank.FOUR,
            },
            {
              suit: Suit.DIAMONDS,
              rank: Rank.TEN,
            },
          ],
          name: 'Jerry' as PlayerName,
          isUser: true,
        },
        stage: GameStage.IN_PROGRESS,
        loser: null,
      }}
    />
  );
};

export const Step4ProceedNoYaniv = () => {
  return (
    <YanivGameView
      onEmojiClick={action('onEmojiClick')}
      gameActions={{
        declareYaniv: action('declareYaniv'),
        endTurn: action('endTurn'),
        pickupFromDeck: action('pickupFromDeck'),
        pickupFromDiscard: action('pickupFromDiscard'),
        deal: action('deal'),
      }}
      reactions={{}}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alvin' as PlayerName,
            scoreHistory: [0],
            handSize: 7,
            isUser: false,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
          {
            id: '2' as UserId,
            name: 'Barney' as PlayerName,
            scoreHistory: [0],
            handSize: 2,
            isUser: true,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
        ],
        discard: {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        },
        userHand: [
          {
            suit: Suit.CLUBS,
            rank: Rank.ACE,
          },
          {
            suit: Suit.HEARTS,
            rank: Rank.ACE,
          },
        ],
        currentPlayer: {
          id: '2' as UserId,
          step: PlayerStep.PROCEED,
          playedCards: [
            {
              suit: Suit.HEARTS,
              rank: Rank.FOUR,
            },
            {
              suit: Suit.DIAMONDS,
              rank: Rank.TEN,
            },
          ],
          name: 'Jerry' as PlayerName,
          isUser: true,
        },
        stage: GameStage.IN_PROGRESS,
        loser: null,
      }}
    />
  );
};

export const Step4ProceedCanYaniv = () => {
  return (
    <YanivGameView
      onEmojiClick={action('onEmojiClick')}
      gameActions={{
        declareYaniv: action('declareYaniv'),
        endTurn: action('endTurn'),
        pickupFromDeck: action('pickupFromDeck'),
        pickupFromDiscard: action('pickupFromDiscard'),
        deal: action('deal'),
      }}
      reactions={{}}
      state={{
        players: [
          {
            id: '1' as UserId,
            name: 'Alvin' as PlayerName,
            scoreHistory: [0],
            handSize: 7,
            isUser: false,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
          {
            id: '2' as UserId,
            name: 'Barney' as PlayerName,
            scoreHistory: [0],
            handSize: 2,
            isUser: true,
            hasCalledYaniv: false,
            isCurrentTurn: false,
          },
        ],
        discard: {
          suit: JokerSuit.BLACK,
          rank: JOKER_RANK,
        },
        userHand: [
          {
            suit: Suit.CLUBS,
            rank: Rank.ACE,
          },
          {
            suit: Suit.HEARTS,
            rank: Rank.ACE,
          },
        ],
        currentPlayer: {
          id: '2' as UserId,
          step: PlayerStep.PROCEED,
          playedCards: [
            {
              suit: Suit.HEARTS,
              rank: Rank.FOUR,
            },
            {
              suit: Suit.DIAMONDS,
              rank: Rank.TEN,
            },
          ],
          name: 'Jerry' as PlayerName,
          isUser: true,
        },
        stage: GameStage.IN_PROGRESS,
        loser: null,
      }}
    />
  );
};
