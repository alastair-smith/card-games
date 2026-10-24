import { CheckIcon } from 'lucide-react';
import { useId } from 'react';
import { cn } from '~/utils/cn';

export type ColorOption = {
  /** Stable identifier for the colour, reported on selection. */
  key: string;
  /** Human-readable name used as the accessible label for the swatch. */
  name: string;
  /** CSS colour string applied to the swatch. */
  value: string;
};

type ColorSwatchesProps = {
  className?: string;
  colors: readonly ColorOption[];
  /** Key of the currently selected colour. */
  value?: string | undefined;
  /** Colour keys that cannot be selected (e.g. already taken by other players). */
  disabledColors?: string[] | undefined;
  onColorSelect: (color: string) => void;
};

/** A radio group of colour swatches. Native radios give free keyboard navigation. */
export function ColorSwatches({
  className,
  colors,
  value,
  disabledColors,
  onColorSelect,
}: ColorSwatchesProps) {
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
      {colors.map((option, index) => {
        const isSelected = option.key === value;
        const isDisabled =
          !isSelected && (disabledColors?.includes(option.key) ?? false);
        // Focus the active swatch on mount (or the first when none is set) so
        // keyboard users land on a radio and can arrow between options.
        const shouldAutoFocus = value ? isSelected : index === 0;

        return (
          <label
            key={option.key}
            className={cn(
              'relative flex size-9',
              isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <input
              type='radio'
              name={groupName}
              value={option.key}
              checked={isSelected}
              disabled={isDisabled}
              aria-label={option.name}
              // biome-ignore lint/a11y/noAutofocus: focuses the active swatch when the picker opens
              autoFocus={shouldAutoFocus}
              onChange={() => onColorSelect(option.key)}
              className='peer sr-only'
            />
            <span
              style={{ backgroundColor: option.value }}
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
