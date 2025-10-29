'use client';

import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
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
  reactions: Record<UserId, { emoji: ReactionEmoji; id: number }>;
}) {
  const pickupCardMutation = api.highCard.pickupCard.useMutation();
  const triggerEmojiMutation = api.highCard.triggerEmoji.useMutation();

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
