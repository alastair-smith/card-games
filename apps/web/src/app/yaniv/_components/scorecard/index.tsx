import { CircleIcon, MegaphoneIcon, SquarePlay } from 'lucide-react';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import { cn } from '~/utils/cn';

type ScoreCardProps = {
  className?: string;
  cardCount: number | null;
  isFiftyScoreHalved: boolean;
  isHundredScoreHalved: boolean;
  name: PlayerName;
  score: number;
  isYanivCalled: boolean;
  isPlayersTurn?: boolean;
  reactionEmoji?: { emoji: string; id: EmojiReactionId };
};

export default function ScoreCard({
  className,
  cardCount,
  isFiftyScoreHalved,
  isHundredScoreHalved,
  name,
  score,
  isYanivCalled,
  isPlayersTurn,
  reactionEmoji,
}: ScoreCardProps) {
  return (
    <div
      className={cn(
        'relative bg-alt-background rounded border-white border flex flex-col',
        isYanivCalled ? 'bg-black' : '',
        className,
      )}
    >
      {isPlayersTurn && (
        <>
          <span className='sr-only'>It's {name}'s turn</span>
          <SquarePlay
            size={20}
            className='absolute top-1 left-1 z-10'
            aria-hidden='true'
          />
        </>
      )}
      {reactionEmoji && (
        <div
          // key changes on each new reaction, forcing React to remount the div
          // and restart the CSS animation from the beginning
          key={reactionEmoji.id}
          className='absolute inset-0 flex items-center justify-center text-5xl animate-reaction-emoji pointer-events-none z-10'
        >
          {reactionEmoji.emoji}
        </div>
      )}
      <div className='flex gap-1 justify-center'>
        <div className='flex flex-1 flex-col justify-center items-center bg-white/20 px-2 py-1'>
          {cardCount !== null && (
            <>
              <span className='text-lg/none sm:text-2xl/tight font-semibold'>
                {cardCount}
              </span>
              <span className='text-sm sm:text-base'>cards</span>
            </>
          )}
        </div>

        <div className='flex flex-col gap-1 px-2 py-1'>
          <div className='col-span-2 justify-self-center flex gap-1 justify-center text-sm md:text-base'>
            <div>Score: </div>
            <div className='min-w-[3ch] text-center'>{score}</div>
          </div>

          <div className='flex justify-between gap-1.5 sm:gap-2'>
            <div className='flex gap-0.5 items-center justify-center'>
              <CircleIcon
                fill={isFiftyScoreHalved ? 'white' : 'transparent'}
                size={12}
              />
              <div className='text-xs sm:text-sm'>
                50
                <span className='sr-only'>
                  {' '}
                  {isFiftyScoreHalved
                    ? 'score has been halved'
                    : 'score has not been halved'}
                </span>
              </div>
            </div>

            <div className='flex gap-0.5 items-center justify-center'>
              <CircleIcon
                fill={isHundredScoreHalved ? 'white' : 'transparent'}
                size={12}
              />
              <div className='text-xs sm:text-sm'>
                100
                <span className='sr-only'>
                  {' '}
                  {isHundredScoreHalved
                    ? 'score has been halved'
                    : 'score has not been halved'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'col-span-2 justify-self-center border-t w-full text-sm font-semibold text-center overflow-hidden',
        )}
      >
        {isYanivCalled ? (
          <div className='flex w-max'>
            <div className='animate-marquee whitespace-nowrap px-4'>
              {name} has called Yaniv!
              <MegaphoneIcon size={16} className='inline-block ml-1' />
            </div>
            <div
              className='animate-marquee whitespace-nowrap px-4'
              aria-hidden='true'
            >
              {name} has called Yaniv!
              <MegaphoneIcon size={16} className='inline-block ml-1' />
            </div>
            <div
              className='animate-marquee whitespace-nowrap px-4'
              aria-hidden='true'
            >
              {name} has called Yaniv!
              <MegaphoneIcon size={16} className='inline-block ml-1' />
            </div>
            <div
              className='animate-marquee whitespace-nowrap px-4'
              aria-hidden='true'
            >
              {name} has called Yaniv!
              <MegaphoneIcon size={16} className='inline-block ml-1' />
            </div>
          </div>
        ) : (
          name
        )}
      </div>
    </div>
  );
}
