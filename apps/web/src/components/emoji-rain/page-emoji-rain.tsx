import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '~/utils/cn';

type Particle = {
  id: string;
  emoji: string;
  xPos: number;
  delay: number;
  duration: number;
};

type Reaction = { emoji: string; id: number };

type PageEmojiRainProps = {
  children: ReactNode;
  className?: string;
  reactions: Reaction[];
};

const PARTICLES_PER_REACTION = 5;
const EMOJI_MAX_WIDTH = 38;
const MIN_DURATION_S = 4;
const MAX_DURATION_S = 8;
const SPAWN_DELAY_S = 1;

/**
 * Rains emojis across a page area, supporting multiple concurrent reactions.
 * Each reaction in the list spawns a batch of particles; particles clean up
 * via onAnimationEnd so concurrent rains from different players coexist.
 */
export function PageEmojiRain({
  children,
  className,
  reactions,
}: PageEmojiRainProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!containerRef.current || reactions.length === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const newParticles: Particle[] = [];

    for (const reaction of reactions) {
      if (!seenIds.current.has(reaction.id)) {
        seenIds.current.add(reaction.id);
        for (let index = 0; index < PARTICLES_PER_REACTION; index++) {
          newParticles.push({
            id: crypto.randomUUID(),
            emoji: reaction.emoji,
            xPos: Math.random() * (containerWidth - EMOJI_MAX_WIDTH),
            delay: Math.random() * SPAWN_DELAY_S,
            duration:
              MIN_DURATION_S +
              Math.random() * (MAX_DURATION_S - MIN_DURATION_S),
          });
        }
      }
    }

    if (newParticles.length > 0) {
      setParticles((previous) => [...previous, ...newParticles]);
    }
  }, [reactions]);

  const handleAnimationEnd = (id: string) => {
    setParticles((previous) =>
      previous.filter((particle) => particle.id !== id),
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-x-clip', className)}
    >
      {children}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className='absolute text-3xl animate-celebration-rain z-50 pointer-events-none'
          style={{
            left: `${particle.xPos}px`,
            top: '-3rem',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(particle.id)}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}
