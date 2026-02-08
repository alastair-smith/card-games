import { cn } from '~/utils/cn';

type PlayAreaProps = {
  className?: string;
};

export default function PlayArea({ className }: PlayAreaProps) {
  return (
    <div
      className={cn(
        ' bg-grey-lily-white border-2 border-dashed border-slate/20 rounded-lg flex items-center justify-center',
        className,
      )}
    >
      <span className='text-slate font-medium'>Play Area Placeholder</span>
    </div>
  );
}
