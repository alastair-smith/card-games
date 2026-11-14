import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { performShare } from './share';

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
