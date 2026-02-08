import { cn } from '~/utils/cn';

type ScoreCardsProps = {
  className?: string;
};

export default function ScoreCards({ className }: ScoreCardsProps) {
  return (
    <div
      className={cn(
        'size-full bg-grey-lily-white border-2 border-dashed border-slate/20 rounded-lg flex items-center justify-center',
        className,
      )}
    >
      <span className='text-slate font-medium'>ScoreCards Placeholder</span>
    </div>
  );
}
