import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';

type FallingEmoji = {
  id: string;
  emoji: string;
  xPos: number;
  delay: number;
  duration: number;
};

type CelebrationRainProps = {
  children: ReactNode;
  className?: string;
  emoji: string;
  isActive: boolean;
};

const BATCH_SIZE = 8;
const SPAWN_INTERVAL_MS = 2000;
const MIN_DURATION_S = 4;
const MAX_DURATION_S = 8;
const EMOJI_MAX_WIDTH = 38;

/**
 * Continuously rains emojis down the screen while active.
 * Unlike EmojiRain, this spawns new batches on an interval
 * and each emoji animates fully off the bottom of the container.
 */
export function CelebrationRain({
  children,
  className,
  emoji,
  isActive,
}: CelebrationRainProps) {
  const [emojis, setEmojis] = useState<FallingEmoji[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    const spawnBatch = () => {
      const batch: FallingEmoji[] = Array.from({ length: BATCH_SIZE }, () => ({
        id: crypto.randomUUID(),
        emoji,
        xPos: Math.random() * (containerWidth - EMOJI_MAX_WIDTH),
        delay: Math.random() * (SPAWN_INTERVAL_MS / 1000),
        duration:
          MIN_DURATION_S + Math.random() * (MAX_DURATION_S - MIN_DURATION_S),
      }));

      setEmojis((previous) => [...previous, ...batch]);
    };

    spawnBatch();
    const interval = setInterval(spawnBatch, SPAWN_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isActive, emoji]);

  const handleAnimationEnd = (id: string) => {
    setEmojis((previous) => previous.filter((entry) => entry.id !== id));
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-x-clip', className)}
    >
      {children}
      {emojis.map((entry) => (
        <div
          key={entry.id}
          className='absolute text-3xl animate-celebration-rain z-50 pointer-events-none'
          style={{
            left: `${entry.xPos}px`,
            top: '-3rem',
            animationDelay: `${entry.delay}s`,
            animationDuration: `${entry.duration}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(entry.id)}
        >
          {entry.emoji}
        </div>
      ))}
    </div>
  );
}
