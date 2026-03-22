import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import type { UserId, PlayerName } from '~/types/entities';
import { GameUpdate, type Player, type ReactionEmoji } from '~/types/game';
import { GameStage, GameStep, type YanivPlayingCard } from '~/types/games/yaniv';
import { Rank, Suit } from '~/types/cards';

export const TEST_USER_ID = 'aaaaaaaa-0000-0000-0000-aaaaaaaaaaaa' as UserId;
export const TEST_USER_NAME = 'Alice' as PlayerName;
export const OTHER_USER_ID = 'bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb' as UserId;
export const OTHER_USER_NAME = 'Bob' as PlayerName;

type StateSubscription =
  | {
      update:
        | GameUpdate.KICKED
        | GameUpdate.LEFT_GAME
        | GameUpdate.GAME_NOT_FOUND
        | GameUpdate.LOBBY_FULL;
    }
  | { update: GameUpdate.LOBBY_UPDATE; players: Player[] }
  | {
      update: GameUpdate.GAME_STATE_UPDATE | GameUpdate.FINISHED;
      state: ClientGameState;
    }
  | {
      update: GameUpdate.EMOJI_REACTION;
      payload: { emoji: ReactionEmoji; targetPlayerId: UserId; id: number };
    };

export type { StateSubscription };

const aliceInProgress = {
  id: TEST_USER_ID,
  name: TEST_USER_NAME,
  isUser: true,
  isHost: true,
  isReady: true,
  cardCount: 3,
  score: 0,
  roundScore: { original: 0, adjusted: 0 },
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  isYanivCalled: false,
};

const bobInProgress = {
  id: OTHER_USER_ID,
  name: OTHER_USER_NAME,
  isUser: false,
  isHost: false,
  isReady: true,
  cardCount: 7,
  score: 0,
  roundScore: { original: 0, adjusted: 0 },
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  isYanivCalled: false,
};

// Hand total: ACE(1) + TWO(2) + THREE(3) = 6, which is ≤7 so Yaniv is callable
export const HAND_CARDS: YanivPlayingCard[] = [
  { rank: Rank.ACE, suit: Suit.SPADES },
  { rank: Rank.TWO, suit: Suit.HEARTS },
  { rank: Rank.THREE, suit: Suit.CLUBS },
];

export const DISCARD_CARD: YanivPlayingCard = {
  rank: Rank.FIVE,
  suit: Suit.DIAMONDS,
};

export function lobbyScenario(): StateSubscription {
  return {
    update: GameUpdate.LOBBY_UPDATE,
    players: [
      {
        id: TEST_USER_ID,
        name: TEST_USER_NAME,
        isReady: false,
        isUser: true,
        isHost: true,
      },
    ],
  };
}

export function inProgressScenario(): StateSubscription {
  return {
    update: GameUpdate.GAME_STATE_UPDATE,
    state: {
      gameStage: GameStage.IN_PROGRESS,
      gameStep: GameStep.PLAY_CARDS,
      hand: HAND_CARDS,
      players: [aliceInProgress, bobInProgress],
      playedCards: [DISCARD_CARD],
      topDiscardCard: DISCARD_CARD,
      currentPlayerId: TEST_USER_ID,
    } as ClientGameState,
  };
}

export function pickupStepScenario(): StateSubscription {
  return {
    update: GameUpdate.GAME_STATE_UPDATE,
    state: {
      gameStage: GameStage.IN_PROGRESS,
      gameStep: GameStep.PICKUP_CARD,
      hand: HAND_CARDS,
      players: [aliceInProgress, bobInProgress],
      playedCards: [DISCARD_CARD],
      topDiscardCard: DISCARD_CARD,
      currentPlayerId: TEST_USER_ID,
    } as ClientGameState,
  };
}

export function pickupScenario(): StateSubscription {
  return {
    update: GameUpdate.GAME_STATE_UPDATE,
    state: {
      gameStage: GameStage.IN_PROGRESS,
      gameStep: GameStep.PROCEED,
      hand: [...HAND_CARDS, DISCARD_CARD],
      players: [{ ...aliceInProgress, cardCount: 4 }, bobInProgress],
      playedCards: [],
      topDiscardCard: null,
      currentPlayerId: TEST_USER_ID,
    } as ClientGameState,
  };
}

export function waitingForOpponentScenario(): StateSubscription {
  return {
    update: GameUpdate.GAME_STATE_UPDATE,
    state: {
      gameStage: GameStage.IN_PROGRESS,
      gameStep: GameStep.PLAY_CARDS,
      hand: HAND_CARDS,
      players: [aliceInProgress, bobInProgress],
      playedCards: [DISCARD_CARD],
      topDiscardCard: DISCARD_CARD,
      currentPlayerId: OTHER_USER_ID,
    } as ClientGameState,
  };
}

export function roundSummaryScenario(): StateSubscription {
  return {
    update: GameUpdate.GAME_STATE_UPDATE,
    state: {
      gameStage: GameStage.IN_PROGRESS,
      gameStep: GameStep.REDEAL,
      hand: [{ rank: Rank.ACE, suit: Suit.SPADES }],
      players: [
        { ...aliceInProgress, isYanivCalled: true, cardCount: 1 },
        {
          ...bobInProgress,
          score: 14,
          roundScore: { original: 14, adjusted: 14 },
          cardCount: 5,
        },
      ],
      playedCards: [],
      topDiscardCard: null,
      currentPlayerId: TEST_USER_ID,
    } as ClientGameState,
  };
}

export function gameOverScenario(): StateSubscription {
  return {
    update: GameUpdate.FINISHED,
    state: {
      gameStage: GameStage.FINISHED,
      hand: [{ rank: Rank.ACE, suit: Suit.SPADES }],
      players: [
        {
          ...aliceInProgress,
          score: 195,
        },
        {
          ...bobInProgress,
          score: 205,
        },
      ],
      winners: [TEST_USER_ID],
    } as ClientGameState,
  };
}
