import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildTableCards } from '~/test-utils/shithead';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStage } from '~/types/games/shithead';
import { TurnAnnouncement, TurnStatus } from '.';

const faceDownOnly = buildTableCards().map((slot) => ({
  ...slot,
  faceUpCard: null,
}));

const buildPlayers = ({
  turnIndex = null,
  confirmedIndexes = [],
  cardCount = 3,
  tableCards = buildTableCards(),
}: {
  turnIndex?: number | null;
  confirmedIndexes?: number[];
  cardCount?: number;
  tableCards?: ReturnType<typeof buildTableCards>;
}) =>
  (['Alice', 'Bob', 'Carol'] as PlayerName[]).map((name, index) => ({
    id: String(index + 1) as UserId,
    name,
    isUser: index === 0,
    isPlayersTurn: index === turnIndex,
    isSwapConfirmed: confirmedIndexes.includes(index),
    cardCount,
    tableCards,
  }));

describe('TurnStatus', () => {
  describe('swapping', () => {
    test('asks you to swap and confirm', () => {
      render(
        <TurnStatus
          gameStage={GameStage.SWAPPING}
          players={buildPlayers({ confirmedIndexes: [1] })}
        />,
      );
      expect(
        screen.getByText('Swap your cards, then confirm'),
      ).toBeInTheDocument();
    });

    test('says who is still swapping once you have confirmed', () => {
      render(
        <TurnStatus
          gameStage={GameStage.SWAPPING}
          players={buildPlayers({ confirmedIndexes: [0, 2] })}
        />,
      );
      expect(
        screen.getByText('Waiting for Bob to finish swapping'),
      ).toBeInTheDocument();
    });

    test('says how many players are still swapping once you have confirmed', () => {
      render(
        <TurnStatus
          gameStage={GameStage.SWAPPING}
          players={buildPlayers({ confirmedIndexes: [0] })}
        />,
      );
      expect(
        screen.getByText('Waiting for 2 players to finish swapping'),
      ).toBeInTheDocument();
    });
  });

  describe('your turn', () => {
    test.each([
      ['your hand has cards', 3, buildTableCards(), 'play from your hand'],
      ['your hand is empty', 0, buildTableCards(), 'play a face-up card'],
      [
        'only face-down cards are left',
        0,
        faceDownOnly,
        'turn over a face-down card',
      ],
    ])(
      'says what to play when %s',
      (_description, cardCount, tableCards, text) => {
        render(
          <TurnStatus
            gameStage={GameStage.IN_PROGRESS}
            players={buildPlayers({ turnIndex: 0, cardCount, tableCards })}
          />,
        );
        expect(screen.getByText(`Your turn: ${text}`)).toBeInTheDocument();
      },
    );
  });

  describe('another player’s turn', () => {
    test.each([
      ['their hand has cards', 3, buildTableCards(), 'playing from their hand'],
      ['their hand is empty', 0, buildTableCards(), 'playing a face-up card'],
      [
        'only face-down cards are left',
        0,
        faceDownOnly,
        'turning over a face-down card',
      ],
    ])(
      'says what they are playing when %s',
      (_description, cardCount, tableCards, text) => {
        render(
          <TurnStatus
            gameStage={GameStage.IN_PROGRESS}
            players={buildPlayers({ turnIndex: 1, cardCount, tableCards })}
          />,
        );
        expect(screen.getByText(`Bob is ${text}`)).toBeInTheDocument();
      },
    );
  });
});

describe('TurnAnnouncement', () => {
  test('announces whose turn it is', () => {
    render(
      <TurnAnnouncement
        gameStage={GameStage.IN_PROGRESS}
        players={buildPlayers({ turnIndex: 2 })}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Carol is playing from their hand',
    );
  });
});
