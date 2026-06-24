import { CheckIcon } from 'lucide-react';
import { cn } from '~/utils/cn';

type ColorPickerProps = {
  className?: string;
  colors: string[];
  value?: string;
  onColorSelect: (color: string) => void;
};

export function ColorPicker({
  className,
  colors,
  value,
  onColorSelect,
}: ColorPickerProps) {
  return (
    <fieldset className={cn('grid grid-cols-6 gap-2 border-0 p-0', className)}>
      <legend className='sr-only'>Colour</legend>
      {colors.map((color) => {
        const isSelected = color === value;

        return (
          <button
            key={color}
            type='button'
            aria-pressed={isSelected}
            aria-label={color}
            onClick={() => onColorSelect(color)}
            style={{ backgroundColor: color }}
            className={cn(
              'flex aspect-square items-center justify-center rounded border border-border',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isSelected && 'ring-2 ring-ring',
            )}
          >
            {isSelected && (
              <CheckIcon
                size={20}
                className='text-light-text'
                aria-hidden='true'
              />
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
