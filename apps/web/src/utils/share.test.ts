import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { GameType } from '~/types/game';
import { buildShareData, performShare } from './share';

describe('buildShareData', () => {
  test('says the user won when they won', () => {
    const { title } = buildShareData({
      gameType: GameType.SHITHEAD,
      isUserWinner: true,
      text: '🥇 Alice',
      host: 'example.com',
    });
    expect(title).toBe('I just won a game of Shithead!');
  });

  test('says the user played when they did not win', () => {
    const { title } = buildShareData({
      gameType: GameType.YANIV,
      isUserWinner: false,
      text: '020 Alice 🏆',
      host: 'example.com',
    });
    expect(title).toBe('I just played a game of Yaniv!');
  });

  test('includes the given text', () => {
    const { text } = buildShareData({
      gameType: GameType.YANIV,
      isUserWinner: false,
      text: '020 Alice 🏆',
      host: 'example.com',
    });
    expect(text).toBe('020 Alice 🏆');
  });

  test("builds the game's URL from the given host", () => {
    const { url } = buildShareData({
      gameType: GameType.SHITHEAD,
      isUserWinner: false,
      text: '🥇 Alice',
      host: 'mygame.example.com',
    });
    expect(url).toBe('https://mygame.example.com/shithead');
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

    test('returns "cancelled" when the share sheet is closed', async () => {
      vi.mocked(navigator.share).mockRejectedValue(
        new DOMException('Share canceled', 'AbortError'),
      );
      await expect(performShare(shareData)).resolves.toBe('cancelled');
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
