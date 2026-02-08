import { cn } from '~/utils/cn';

type HandProps = {
  className?: string;
};

export default function Hand({ className }: HandProps) {
  return (
    <div
      className={cn(
        'size-full bg-grey-lily-white border-2 border-dashed border-slate/20 rounded-lg flex items-center justify-center',
        className,
      )}
    >
      <span className='text-slate font-medium'>Hand Placeholder</span>
    </div>
  );
}
