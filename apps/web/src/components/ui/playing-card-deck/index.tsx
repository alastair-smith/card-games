import { PlayingCard } from '~/components/ui/playing-card';
import { cn } from '~/utils/cn';

type PlayingCardDeckProps = {
  className?: string;
  fontSize?: `text-${string}`;
};

export function PlayingCardDeck({ className, fontSize }: PlayingCardDeckProps) {
  return (
    <div
      className={cn(
        'relative w-fit pt-[0.56em] pr-[0.44em]',
        fontSize,
        className,
      )}
    >
      <div className='w-fit relative'>
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.32em] -translate-y-[0.44em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.24em] -translate-y-[0.33em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.16em] -translate-y-[0.22em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] absolute inset-0 translate-x-[0.08em] -translate-y-[0.11em] rounded-[0.22em] border-[0.056em] border-border/50 bg-white' />
        <div className='w-[3.75em] h-[5.25em] relative border-[0.056em] border-border/50 rounded-[0.22em]'>
          <PlayingCard card={null} className={fontSize} />
        </div>
      </div>
    </div>
  );
}
