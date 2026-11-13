import { describe, expect, test } from 'vitest';
import { toAddress } from './invite-players';

describe('toAddress', () => {
  test('shows the site name in its own case, without the protocol', () => {
    expect(toAddress(new URL('https://playcards.games/yaniv/4LP55C'))).toBe(
      'PlayCards.Games / yaniv / 4LP55C',
    );
  });

  test('shows any other host as it is', () => {
    expect(toAddress(new URL('http://localhost:3000/yaniv/4LP55C'))).toBe(
      'localhost:3000 / yaniv / 4LP55C',
    );
  });
});
