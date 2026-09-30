import { useId } from 'react';
import { Input } from '~/components/ui/input';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '~/types/entities';
import { cn } from '~/utils/cn';

const COUNT_HIDDEN_UP_TO_LENGTH = 8;

export function PlayerNameInput({
  className,
  name,
  onNameChange,
}: {
  className?: string;
  name: string;
  onNameChange: (name: string) => void;
}) {
  const countId = useId();
  const isCountShown = name.length > COUNT_HIDDEN_UP_TO_LENGTH;

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        className='pr-14'
        aria-label='Your name'
        placeholder='Name required'
        aria-invalid={name.length < MIN_NAME_LENGTH}
        aria-describedby={isCountShown ? countId : undefined}
        maxLength={MAX_NAME_LENGTH}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      {isCountShown && (
        <span
          id={countId}
          className='text-light-text-disabled pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs tabular-nums'
        >
          {name.length}/{MAX_NAME_LENGTH}
        </span>
      )}
    </div>
  );
}
