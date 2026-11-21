'use client';

import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '~/trpc/react';
import type { EmojiReactionId, UserId } from '~/types/entities';
import type { GameCode, ReactionEmoji } from '~/types/game';
import type { GameState } from '~/types/games/high-card';
import HighCardGameView from './game-view';

export default function HighCardGameController({
  code,
  state,
  reactions,
}: {
  code: GameCode;
  state: GameState;
  reactions: Record<UserId, { emoji: ReactionEmoji; id: EmojiReactionId }>;
}) {
  const trpc = useTRPC();
  const pickupCardMutation = useMutation(
    trpc.highCard.pickupCard.mutationOptions(),
  );
  const triggerEmojiMutation = useMutation(
    trpc.highCard.triggerEmoji.mutationOptions(),
  );

  const handleEmojiClick = (emoji: ReactionEmoji) => {
    triggerEmojiMutation.mutate({
      code,
      emoji,
    });
  };

  return (
    <HighCardGameView
      state={state}
      pickupCard={() => {
        pickupCardMutation.mutate({ code });
      }}
      onEmojiClick={handleEmojiClick}
      reactions={reactions}
    />
  );
}
