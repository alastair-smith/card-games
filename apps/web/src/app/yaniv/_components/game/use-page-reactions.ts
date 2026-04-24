import { useEffect, useRef, useState } from 'react';
import type { UserId } from '~/types/entities';
import type { ReactionEmoji, SystemEmoji } from '~/types/game';

type Player = {
  id: UserId;
  isYanivCalled: boolean;
  emojiReaction?: { emoji: ReactionEmoji | SystemEmoji; id: number };
};

type PageReaction = { emoji: string; id: number };

const REACTION_EXPIRY_MS = 5000;

export function usePageReactions(players: Player[]): PageReaction[] {
  const [reactions, setReactions] = useState<PageReaction[]>([]);
  const isFirstRender = useRef(true);
  const seenReactionIds = useRef<Map<UserId, number>>(new Map());
  const previousYanivCalledRef = useRef<Map<UserId, boolean>>(new Map());
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    return () => {
      for (const timeout of timeoutsRef.current.values()) {
        clearTimeout(timeout);
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousYanivCalledRef.current = new Map(
        players.map((player) => [player.id, player.isYanivCalled]),
      );
      for (const player of players) {
        if (player.emojiReaction) {
          seenReactionIds.current.set(player.id, player.emojiReaction.id);
        }
      }
      return;
    }

    const newReactions: PageReaction[] = [];

    for (const player of players) {
      if (player.emojiReaction) {
        const lastSeenId = seenReactionIds.current.get(player.id);
        if (lastSeenId !== player.emojiReaction.id) {
          seenReactionIds.current.set(player.id, player.emojiReaction.id);
          newReactions.push(player.emojiReaction);
        }
      }
    }

    const previous = previousYanivCalledRef.current;
    for (const player of players) {
      const wasCalled = previous.get(player.id) ?? false;
      if (!wasCalled && player.isYanivCalled) {
        newReactions.push({ emoji: '📢', id: Date.now() });
      }
    }
    previousYanivCalledRef.current = new Map(
      players.map((player) => [player.id, player.isYanivCalled]),
    );

    for (const reaction of newReactions) {
      setReactions((current) => [...current, reaction]);
      const timeout = setTimeout(() => {
        setReactions((current) => current.filter((r) => r.id !== reaction.id));
        timeoutsRef.current.delete(reaction.id);
      }, REACTION_EXPIRY_MS);
      timeoutsRef.current.set(reaction.id, timeout);
    }
  }, [players]);

  return reactions;
}
