import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import { buildShareData, buildShareText, performShare } from './share';

const players = [
  { id: '1' as UserId, name: 'Alice' as PlayerName, score: 20, isWinner: true },
  { id: '2' as UserId, name: 'Bob' as PlayerName, score: 5, isWinner: false },
  {
    id: '3' as UserId,
    name: 'Charlie' as PlayerName,
    score: 100,
    isWinner: false,
  },
];

describe('buildShareText', () => {
  test('zero-pads scores to 3 digits', () => {
    const result = buildShareText([
      {
        id: '1' as UserId,
        name: 'Alice' as PlayerName,
        score: 5,
        isWinner: false,
      },
    ]);
    expect(result).toContain('005');
  });

  test('appends trophy emoji to winners', () => {
    const result = buildShareText(players);
    expect(result).toContain('Alice 🏆');
  });

  test('does not append trophy emoji to non-winners', () => {
    const result = buildShareText(players);
    expect(result).not.toContain('Bob 🏆');
    expect(result).not.toContain('Charlie 🏆');
  });

  test('joins players with newlines', () => {
    const result = buildShareText(players);
    expect(result).toBe('020 Alice 🏆\n005 Bob\n100 Charlie');
  });
});

describe('buildShareData', () => {
  test('sets won title when the user is a winner', () => {
    const { title } = buildShareData(players, '1' as UserId, 'example.com');
    expect(title).toBe('I just won a game of Yaniv!');
  });

  test('sets played title when the user did not win', () => {
    const { title } = buildShareData(players, '2' as UserId, 'example.com');
    expect(title).toBe('I just played a game of Yaniv!');
  });

  test('includes the formatted scoreboard as text', () => {
    const { text } = buildShareData(players, '2' as UserId, 'example.com');
    expect(text).toBe(buildShareText(players));
  });

  test('builds the Yaniv game URL from the given host', () => {
    const { url } = buildShareData(
      players,
      '2' as UserId,
      'mygame.example.com',
    );
    expect(url).toBe('https://mygame.example.com/yaniv');
  });
});

describe('performShare', () => {
  const shareData: ShareData = {
    title: 'I just played a game of Yaniv!',
    text: '020 Alice 🏆\n005 Bob',
    url: 'https://example.com/yaniv',
  };

  describe('when navigator.share is available', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        share: vi.fn().mockResolvedValue(undefined),
        clipboard: { writeText: vi.fn() },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test('calls navigator.share with the share data', async () => {
      await performShare(shareData);
      expect(navigator.share).toHaveBeenCalledWith(shareData);
    });

    test('returns "shared"', async () => {
      const result = await performShare(shareData);
      expect(result).toBe('shared');
    });

    test('does not write to clipboard', async () => {
      await performShare(shareData);
      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    test('re-throws when navigator.share throws', async () => {
      vi.mocked(navigator.share).mockRejectedValue(new Error('cancelled'));
      await expect(performShare(shareData)).rejects.toThrow('cancelled');
    });
  });

  describe('when navigator.share is not available', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        share: undefined,
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test('writes to clipboard', async () => {
      await performShare(shareData);
      expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    });

    test('clipboard text includes title, scoreboard, and URL', async () => {
      await performShare(shareData);
      const written = vi.mocked(navigator.clipboard.writeText).mock
        .calls[0]?.[0];
      const expected = `${shareData.title}\n\n${shareData.text}\n\nPlay at ${shareData.url}`;
      expect(written).toBe(expected);
    });

    test('returns "copied"', async () => {
      const result = await performShare(shareData);
      expect(result).toBe('copied');
    });

    test('re-throws when clipboard write throws', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
        new Error('clipboard denied'),
      );
      await expect(performShare(shareData)).rejects.toThrow('clipboard denied');
    });
  });
});
