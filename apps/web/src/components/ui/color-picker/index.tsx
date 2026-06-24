import { CheckIcon } from 'lucide-react';
import { useId } from 'react';
import { cn } from '~/utils/cn';

type ColorPickerProps = {
  className?: string;
  colors: string[];
  value?: string;
  /** Colours that cannot be selected (e.g. already taken by other players). */
  disabledColors?: string[];
  onColorSelect: (color: string) => void;
};

export function ColorPicker({
  className,
  colors,
  value,
  disabledColors,
  onColorSelect,
}: ColorPickerProps) {
  const groupName = useId();

  return (
    <fieldset
      className={cn('grid grid-cols-4 gap-2 border-0 p-0', className)}
      // Native radios handle arrow-key navigation; stop arrow keys reaching an
      // ancestor menu (e.g. a dropdown) that would otherwise hijack focus.
      onKeyDown={(event) => {
        if (event.key.startsWith('Arrow')) {
          event.stopPropagation();
        }
      }}
    >
      <legend className='sr-only'>Colour</legend>
      {colors.map((color, index) => {
        const isSelected = color === value;
        const isDisabled =
          !isSelected && (disabledColors?.includes(color) ?? false);
        // Focus the active swatch on mount (or the first when none is set) so
        // keyboard users land on a radio and can arrow between options.
        const shouldAutoFocus = value ? isSelected : index === 0;

        return (
          <label
            key={color}
            className={cn(
              'relative flex aspect-square',
              isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <input
              type='radio'
              name={groupName}
              value={color}
              checked={isSelected}
              disabled={isDisabled}
              aria-label={color}
              // biome-ignore lint/a11y/noAutofocus: focuses the active swatch when the picker opens
              autoFocus={shouldAutoFocus}
              onChange={() => onColorSelect(color)}
              className='peer sr-only'
            />
            <span
              style={{ backgroundColor: color }}
              className={cn(
                'flex flex-1 items-center justify-center rounded border border-border',
                'peer-checked:ring-2 peer-checked:ring-ring',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                'peer-disabled:opacity-30',
              )}
            >
              {isSelected && (
                <CheckIcon
                  size={20}
                  className='icon-outline-black text-white'
                  aria-hidden='true'
                />
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
