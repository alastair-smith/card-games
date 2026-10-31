import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep } from '~/types/games/yaniv';
import { TurnAnnouncement, TurnStatus } from '.';

const USER_ID = '1' as UserId;

const buildPlayers = ({
  turnIndex,
  yanivCallerIndex,
}: {
  turnIndex: number;
  yanivCallerIndex?: number;
}) =>
  (['Alice', 'Bob'] as PlayerName[]).map((name, index) => ({
    id: String(index + 1) as UserId,
    name,
    isPlayersTurn: index === turnIndex,
    isYanivCalled: index === yanivCallerIndex,
  }));

describe('TurnStatus', () => {
  describe('your turn', () => {
    test.each([
      [GameStep.PLAY_CARDS, 'Your turn: choose what to play'],
      [GameStep.PICKUP_CARD, 'Pick up from the deck or discard pile'],
      [GameStep.PROCEED, 'Call Yaniv or end your turn'],
      [GameStep.REDEAL, 'Deal the next round'],
    ])('says what to do when you need to %s', (step, text) => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 0 })}
          userId={USER_ID}
          step={step}
          pickupSource={null}
        />,
      );
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  describe('another player’s turn', () => {
    test.each([
      [GameStep.PLAY_CARDS, 'Bob is choosing cards'],
      [GameStep.PICKUP_CARD, 'Bob is picking up'],
      [GameStep.REDEAL, 'Bob to deal'],
    ])('says what they are doing when they need to %s', (step, text) => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 1 })}
          userId={USER_ID}
          step={step}
          pickupSource={null}
        />,
      );
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    test.each([
      ['deck', 'Bob has drawn from the deck'],
      ['discard', 'Bob has drawn from the discard'],
    ] as const)(
      'says where they picked up from the %s',
      (pickupSource, text) => {
        render(
          <TurnStatus
            players={buildPlayers({ turnIndex: 1 })}
            userId={USER_ID}
            step={GameStep.PROCEED}
            pickupSource={pickupSource}
          />,
        );
        expect(screen.getByText(text)).toBeInTheDocument();
      },
    );

    test('says when they matched the discard rather than picking up', () => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 1 })}
          userId={USER_ID}
          step={GameStep.PROCEED}
          pickupSource={null}
        />,
      );
      expect(screen.getByText('Bob matched the discard')).toBeInTheDocument();
    });
  });

  describe('Yaniv called', () => {
    test('says who called Yaniv during the last turns', () => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 0, yanivCallerIndex: 1 })}
          userId={USER_ID}
          step={GameStep.PLAY_CARDS}
          pickupSource={null}
        />,
      );
      expect(
        screen.getByText('Bob called Yaniv! Last turns'),
      ).toBeInTheDocument();
    });

    test('says when you called Yaniv', () => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 1, yanivCallerIndex: 0 })}
          userId={USER_ID}
          step={GameStep.PLAY_CARDS}
          pickupSource={null}
        />,
      );
      expect(
        screen.getByText('You called Yaniv! Last turns'),
      ).toBeInTheDocument();
    });

    test('stops mentioning the last turns once the round is over', () => {
      render(
        <TurnStatus
          players={buildPlayers({ turnIndex: 1, yanivCallerIndex: 1 })}
          userId={USER_ID}
          step={GameStep.REDEAL}
          pickupSource={null}
        />,
      );
      expect(screen.queryByText(/Last turns/)).not.toBeInTheDocument();
    });
  });
});

describe('TurnAnnouncement', () => {
  test('announces whose turn it is', () => {
    render(
      <TurnAnnouncement
        players={buildPlayers({ turnIndex: 1 })}
        userId={USER_ID}
        step={GameStep.PICKUP_CARD}
        pickupSource={null}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Bob is picking up');
  });

  test('announces a Yaniv call along with the turn', () => {
    render(
      <TurnAnnouncement
        players={buildPlayers({ turnIndex: 0, yanivCallerIndex: 1 })}
        userId={USER_ID}
        step={GameStep.PLAY_CARDS}
        pickupSource={null}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Bob called Yaniv! Last turns. Your turn: choose what to play',
    );
  });
});
