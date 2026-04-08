import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';

type Emoji = {
  id: string;
  emoji: string;
  xPos: number;
  yPos: number;
};

type Reaction = { emoji: string; id: number };

type EmojiRainProps = {
  children: ReactNode;
  className?: string;
  reaction?: Reaction;
  count?: number;
};

const NUMBER_OF_EMOJIS = 20;
const EMOJI_MAX_WIDTH = 38; // approximate width of emoji in px
const PERCENTAGE_START_RANGE = -300; // start position range above the content in percentage

/**
 * Creates an effect of several emojis trickling down the screen
 */
export function EmojiRain({
  children,
  className,
  reaction,
  count = NUMBER_OF_EMOJIS,
}: EmojiRainProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !reaction) return;

    const containerWidth = containerRef.current.offsetWidth;

    setEmojis(
      Array.from({ length: count }, () => ({
        xPos: Math.random() * (containerWidth - EMOJI_MAX_WIDTH),
        yPos: Math.random() * PERCENTAGE_START_RANGE,
        id: crypto.randomUUID(),
        emoji: reaction.emoji,
      })),
    );
  }, [reaction, count]);

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
}
