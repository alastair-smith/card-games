import { useEffect, useRef, useState } from 'react';
import type { UserId } from '~/types/entities';
import type { ReactionEmoji, SystemEmoji } from '~/types/game';

type Player = {
  id: UserId;
  emojiReaction?: { emoji: ReactionEmoji | SystemEmoji; id: number };
};

type PageReaction = { emoji: string; id: number };

const REACTION_EXPIRY_MS = 5000;

export function usePageReactions(players: Player[]): PageReaction[] {
  const [reactions, setReactions] = useState<PageReaction[]>([]);
  const isFirstRender = useRef(true);
  const seenReactionIds = useRef<Map<UserId, number>>(new Map());
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
