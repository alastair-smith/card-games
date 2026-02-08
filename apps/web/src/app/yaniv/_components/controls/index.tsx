import { cn } from '~/utils/cn';

type ControlsProps = {
  className?: string;
};

export default function Controls({ className }: ControlsProps) {
  return (
    <div
      className={cn(
        'size-full bg-grey-lily-white border-2 border-dashed border-slate/20 rounded-lg flex items-center justify-center',
        className,
      )}
    >
      <span className='text-slate font-medium'>Controls Placeholder</span>
    </div>
  );
}
