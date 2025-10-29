'use client';

import React, {
  type ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ReactionEmoji } from '~/types/game';
import { cn } from '~/utils/cn';

type Emoji = {
  id: string;
  emoji: ReactionEmoji;
  xPos: number;
  yPos: number;
};

export type EmojiRainRef = {
  triggerEmoji: (emoji: ReactionEmoji) => void;
};

type EmojiRainProps = {
  children: ReactNode;
  className?: string;
};

const NUMBER_OF_EMOJIS = 20;
const EMOJI_MAX_WIDTH = 38; // approximate width of emoji in px
const PERCENTAGE_START_RANGE = -300; // start position range above the content in percentage

// TODO
// Create multiple emojis at once, with random delay between them
// fix refs on mobile
// create backend integration to send emojis to other players
// create multiple drops of rain instead of just 1 per click

/**
 * Creates an effect of several emojis trickling down the screen
 */
export const EmojiRain = React.forwardRef<EmojiRainRef, EmojiRainProps>(
  ({ children, className }, ref) => {
    const [emojis, setEmojis] = useState<Emoji[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      triggerEmoji: (emoji: ReactionEmoji) => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;

        const emojis = Array.from({ length: NUMBER_OF_EMOJIS }, () => ({
          xPos: Math.random() * (containerWidth - EMOJI_MAX_WIDTH),
          yPos: Math.random() * PERCENTAGE_START_RANGE,
          id: crypto.randomUUID(),
          emoji,
        }));

        setEmojis(emojis);
      },
    }));

    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-hidden', className)}
      >
        {children}
        {emojis.map((e) => (
          <div
            key={e.id}
            className='absolute text-3xl animate-rain z-50'
            style={{ left: `${e.xPos}px`, top: `${e.yPos}%` }}
          >
            {e.emoji}
          </div>
        ))}
      </div>
    );
  },
);

EmojiRain.displayName = 'EmojiRain';
