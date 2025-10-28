'use client';

import React, {
  type ReactNode,
  useEffect,
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
};

export type EmojiRainRef = {
  triggerEmoji: (emoji: ReactionEmoji) => void;
};

type EmojiRainProps = {
  children: ReactNode;
  className?: string;
};

const EMOJI_DURATION = 3000; // milliseconds

export const EmojiRain = React.forwardRef<EmojiRainRef, EmojiRainProps>(
  ({ children, className }, ref) => {
    const [emojis, setEmojis] = useState<Emoji[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      triggerEmoji: (emoji: ReactionEmoji) => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const xPos = Math.random() * (containerWidth - 30); // 30px for emoji width approximation

        setEmojis((prevEmojis) => [
          ...prevEmojis,
          { id: crypto.randomUUID(), emoji, xPos },
        ]);
      },
    }));

    useEffect(() => {
      if (emojis.length === 0) return;

      const timer = setTimeout(() => {
        setEmojis((prevEmojis) => prevEmojis.slice(1));
      }, EMOJI_DURATION);

      return () => clearTimeout(timer);
    }, [emojis]);

    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-hidden', className)}
      >
        {children}
        {emojis.map((e) => (
          <div
            key={e.id}
            className='absolute top-0 text-3xl animate-rain z-50'
            style={{ left: `${e.xPos}px` }}
          >
            {e.emoji}
          </div>
        ))}
      </div>
    );
  },
);

EmojiRain.displayName = 'EmojiRain';
