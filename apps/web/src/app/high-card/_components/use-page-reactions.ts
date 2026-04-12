import { useEffect, useRef, useState } from 'react';
import type { UserId } from '~/types/entities';

type PageReaction = { emoji: string; id: number };

const REACTION_EXPIRY_MS = 5000;

export function usePageReactions(
  reactions: Record<UserId, { emoji: string; id: number }>,
): PageReaction[] {
  const [pageReactions, setPageReactions] = useState<PageReaction[]>([]);
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
      for (const [userId, reaction] of Object.entries(reactions) as [
        UserId,
        { emoji: string; id: number },
      ][]) {
        seenReactionIds.current.set(userId, reaction.id);
      }
      return;
    }

    for (const [userId, reaction] of Object.entries(reactions) as [
      UserId,
      { emoji: string; id: number },
    ][]) {
      const lastSeenId = seenReactionIds.current.get(userId);
      if (lastSeenId !== reaction.id) {
        seenReactionIds.current.set(userId, reaction.id);

        setPageReactions((current) => [...current, reaction]);
        const timeout = setTimeout(() => {
          setPageReactions((current) =>
            current.filter((r) => r.id !== reaction.id),
          );
          timeoutsRef.current.delete(reaction.id);
        }, REACTION_EXPIRY_MS);
        timeoutsRef.current.set(reaction.id, timeout);
      }
    }
  }, [reactions]);

  return pageReactions;
}
