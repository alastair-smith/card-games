import { cn } from '~/utils/cn';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { type ColorOption, ColorSwatches } from './color-swatches';

/** A static colour swatch, for displaying a colour that can't be changed. */
export function ColorSwatch({
  color,
  className,
}: {
  /** CSS colour string to fill the swatch. */
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn('block size-6 rounded border border-border', className)}
      style={{ backgroundColor: color }}
    />
  );
}

type ColorPickerProps = {
  colors: readonly ColorOption[];
  /** Key of the currently selected colour. */
  value?: string;
  /** Colour keys that cannot be selected (e.g. already taken by other players). */
  disabledColors?: string[];
  /** Accessible label for the trigger button. */
  label?: string;
  onColorSelect: (color: string) => void;
};

/**
 * A colour input: a swatch button that opens a popover of selectable colours.
 */
export function ColorPicker({
  colors,
  value,
  disabledColors,
  label = 'Change colour',
  onColorSelect,
}: ColorPickerProps) {
  const selected = colors.find((option) => option.key === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='secondary' size='icon' aria-label={label}>
          <ColorSwatch color={selected?.value ?? 'transparent'} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // Let the picker focus its active swatch instead of the popover
        // container, so arrow-key navigation between colours works immediately.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ColorSwatches
          colors={colors}
          value={value}
          disabledColors={disabledColors}
          onColorSelect={onColorSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
